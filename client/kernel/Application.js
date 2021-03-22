class Application {
    constructor(configuration) {
        this.controllers = {};    
        this.useSockets = false;
        this.socketsURL = false;
        this.appStarted = false;
        this.viewsLoadedCount = 0;
        this.firstLoadElementId = configuration.firstLoadElementId;

        if(configuration.routing !== undefined) {
            this.routing = configuration.routing;
        } else {
            this.routing = [];
            if(configuration.controllers !== undefined) {
                configuration.controllers.forEach(controller => {
                    this.routing[`/${controller.name}`] = controller.name;
                });
            } 
        }

        if(configuration.useSockets !== undefined && configuration.socketsURL !== undefined) {
            this.useSockets = configuration.useSockets;
            this.socketsURL = configuration.socketsURL;
        }

        if(configuration.controllers !== undefined) {
            this.controllers_configuration = configuration.controllers;
        }

        try {
        this.loadControllers()
            // .then(() => this.startApplication())
            .then(() => {
                console.log('Waiting while views be loaded');
                window.onpopstate = (event) => this.changePath(event.target.location.href);
            })
            .catch(error => console.error(error));
            return this;
        } catch {
            return false;
        }
    }

    async loadControllers() {
        for(let i = 0; i < this.controllers_configuration.length; i++) {
            let controller = this.controllers_configuration[i];
            if(controller.name === undefined || controller.url === undefined) {
                continue;
            }

            await import(controller.url)
                .then(module => {
                    controller.settings.app = this;
                    controller.settings.name = controller.name;
                    this.controllers[controller.name] = new module.default(controller.settings);
                })
                .catch(error => console.error(error));
        }
    }

    viewLoaded(controllerName) {
        if(this.appStarted == true) {
            return;
        }

        console.log(controllerName);
        this.getController(controllerName).hide();

        this.viewsLoadedCount++;
        this.onControllerLoaded(controllerName);
        if(this.controllers_configuration.length === this.viewsLoadedCount) {
            if(this.firstLoadElementId) {
                document.getElementById(this.firstLoadElementId).style.display = 'none';
            }
            console.log('All views loaded');
            this.appStarted = true;
            this.startApplication();
        }
    }

    onControllerLoaded(name) {

    }

    onStartApp() {
        console.log('Redifine startup function');
    }

    onSocketConnected() {
        console.log('Custom callback on socket connected');
    }

    onSocketDisconnected() {
        console.log('Custom callback on socket disconnected');
    }

    startApplication() {
        this.socket = undefined;
        this.socketConnected = false;
        
        console.info('Application started');
        this.onStartApp();

        //Redirect on page by url
        this.changePage(window.location.href);

        if(this.useSockets && this.socketsURL) {
            this.socket = io(this.socketsURL);
            
            //socket connected
            this.socket.on('connect', () => {
                this.socketConnected = true;
                this.onSocketConnected();
            });

            this.socket.on('disconnect', () => {
                this.socketConnected = false;
                this.onSocketDisconnected();
            });
        }
    }

    getController(name) {
        return this.controllers[name];
    }

    changePath(route) {
        let url;
        if(!(route instanceof URL)) {
            url = new URL(route, location.href);
        } else {
            url = route;
        }
        
        let searchParams = [];
        url.searchParams.forEach((value, name) => {
            searchParams.push({
                name: name,
                value: value
            });
        });

        let names = [];
        if(typeof this.routing[url.pathname] === 'string') {
            names = this.routing[url.pathname].split(',');
        } else {
            names = this.routing[url.pathname];
        }
        if(url.pathname === undefined) {
            this.show404();
        }

        // Hide all controllers
        // Object.keys(this.controllers).forEach(key => {
        //     this.controllers[key].hide();
        // });

        try {
            names.forEach(name => {
                this.getController(name.replace(/\s/g, '')).show().onLoad(searchParams);
                this.searchParams = searchParams;
                this.pathname = url.pathname;
                this.onPageChange(this.searchParams, this.pathname);
            });
        } catch {
            this.show404();
        }
    }

    onPageChange() {

    }

    show404() {
        console.error('This method is for 404 error');
    }

    changePage(url = '', args = [], title = '') {
        try{
            let newUrl = new URL(url, location.href);
            args.forEach(arg => {
                newUrl.searchParams.append(arg.name, arg.value);
            });

            this.changePath(newUrl);
            history.pushState(null, title, newUrl);
            return true;
        } catch {
            console.error('Error on change page');
            return false;
        }
    }
}   
