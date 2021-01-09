/**
 * Every page base class
 */
class Controller {
    //Constructor
    constructor(config) {
        if(typeof config == 'string') {
            config = JSON.parse(config);
        }

        if(config.name === undefined) {
            console.log('You most give a name');
            return null;
        }

        if($("#" + this.name).length != 0) {
            console.log('This id exist');
            return null;
        }

        if(config.parent !== undefined && $('#' + config.parent).length != 0) {
            this.parent = config.parent;
        } else {
            this.parent = null;
        }

        this.name = config.name;
        this.classes = config.classes;

        if(config.view !== undefined) {
            if(this.updateView(config.view) == false) {
                return null;
            }

            if(config.show !== undefined) {
                this.show(config.show);
            } else {
                this.hide();
            }
        } else {
            this.hide();
            console.log('View was not given. Use updateView method');
            return this;
        }
    }

    //Update view
    updateView(view) {
        if(typeof view != 'string') {
            console.log('View sholud be a string');
            return false;
        }

        return this.updateDOM(view);
    }

    //Update DOM existing dom element
    updateDOM(view) {
        if($("#" + this.name).length == 0) {
            if(this.createDOM()) {
                $("#" + this.name).html(view);
            } else {
                return false;
            }
        }

        $("#" + this.name).html(view);
        return true;
    }

    //Create new DOM element
    createDOM() {
        if($("#content").length == 0) {
            $('body').append('<div id=content></div>');
        }

        if(this.parent == null) {
            $('#content').append('<div id='+this.name+'></div>');
        } else {
            $('#' + this.parent).append('<div id='+this.name+'></div>');
        }

        if(this.classes !== undefined) {
            if(!this.addClass(this.classes, false)) {
                return false;
            }
        }

        return true;
    }

    //On hide function
    onHide() {

    }

    //On show function
    onShow() {

    }

    //Fade in
    fadeIn(param = undefined, callBack = false) {
        if({}.toString.call(callBack) === '[object Function]') {
            callBack();
        }

        this.onShow();

        if(param != undefined) {
            $('#' + this.name).fadeIn(param);
        } else {
            $('#' + this.name).fadeIn();
        }

        return this;
    }

    //Fade out
    fadeOut(param = undefined, callBack = false) {
        if({}.toString.call(callBack) === '[object Function]') {
            callBack();
        }

        this.onHide();

        if(param != undefined) {
            $('#' + this.name).fadeOut(param);
        } else {
            $('#' + this.name).fadeOut();
        }

        return this;
    }

    //Show
    show(isShow = true, time = 0) {
        if(isShow) {
            this.onShow();
            $('#' + this.name).show(time);
        } else {
            $('#' + this.name).hide(time);
        }

        return this;
    }

    //Get HTML
    getHTML() {
        return $('#' + this.name).html();
    }

    //Set HTML
    html(str) {
        $('#' + this.name).html(str);
    }

    //Hide
    hide(time = 0) {
        this.onHide();
        return this.show(false, time);
    }

    //Toggle
    toggle(time = 100) {
        $('#' + this.name).toggle(time);

        return this;
    }

    //Add classes
    addClass(classes, returnThis = true) {
        this.classes = classes;

        if($("#" + this.name).length == 0) {
            console.log('Id not found');
            return false;
        }

        if(typeof classes != 'string') {
            console.log('Classes should be a string');
            return false;
        }

        $('#' + this.name).addClass(this.classes);

        if(returnThis) {
            return this;
        }

        return true;
    }

    //Load view from file
    loadView(url, returnThis = true) {
        var response = 'Cant get view';
        $.ajax({
            type: "GET",   
            url: url,   
            async: false,
            success : function(text) {
                response = text;
            }
        });
    
        response = this.compile(response);

        if(returnThis) {
            this.updateView(response);
            return this;
        }

        return response;
    }

    //Compile loaded view
    /**
     * 
     * @param {string} view 
     * @param {boolean} load if yes -> this.loadView -> this.updateView
     */
    compile(view, load = false) {
        if(load !== false) {
            return this.loadView(view);
        }

        let parser = new Parser();
        return parser.makeTreeFromString(view).parse();
    }

    compileFromTree(tree, load = false) {
        if(load !== false) {
            return this.loadView(view);
        }

        let parser = new Parser();
        return parser.parse(tree);
    }

    //Update
    update() {
        console.log('Redefine this method');
        return this;
    }

    //Open another page
    open(name, delay = 0) {
        if(name == undefined) {
            console.log('You must give a name of page or object');
            return this;
        }

        this.hide();

        if(typeof name == 'string') {
            $('#' + name).show(delay);
        } else {
            name.show(true, delay);
            return name;
        }

        return this;
    }
}