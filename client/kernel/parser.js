class Parser {
    constructor(config = {}) {
        this.tree = config.tree ?? [];
        this.result = '';
    }

    /**
     * Tokens:
     *  text
     *  var
     *  loop
     *  if
     */
    makeTreeFromString(string) {
        if(typeof string !== 'string') {
            return false;
        }

        this.tree = [];
        this.tree.push({
            type: 'core',
            value: '',
            childs: []
        });

        if(!string.length) {
            return false;
        }

        this.addChild(this.tree[0], {
            type: 'text',
            value: '',
            childs: []
        });

        return this.iteract(this.tree[0], this.tree[0].childs[0], string, 0);
    }

    iteract(parent, node, string, index = 0) {
        //Get params for loop
        if(node.type === 'params') {
            node.value = [];
            let param = '';
            for(; index < string.length; index++) {
                if(string[index] == ':') {
                    node.value.push(param);
                    param = '';

                    if(node.value.length == 2 && parent.type === 'loop') {
                        //Parent new child text 
                        this.addChild(parent, {
                            type: 'text',
                            value: '',
                            childs: []
                        });

                        return this.iteract(parent, parent.childs[parent.childs.length - 1], string, index + 2);
                    }

                    if(node.value.length == 1 && parent.type === 'if') {
                        //Parent new child text 
                        this.addChild(parent, {
                            type: 'text',
                            value: '',
                            childs: []
                        });

                        return this.iteract(parent, parent.childs[parent.childs.length - 1], string, index + 2);
                    }
                } else {
                    param += string[index];
                }
            }
        }
        
        for(; index < string.length; index++) {
            let ch = string[index];
            let nextCh = string[index+1];

            // if special characters
            if(ch == '{') {
                switch(nextCh) {
                    //Variable
                    case '{':
                        //Parent new child var
                        this.addChild(parent, {
                            type: 'variable',
                            value: '',
                            childs: []
                        });

                        //Parse while var not closed
                        index = this.iteract(parent, parent.childs[parent.childs.length - 1], string, index+2);
                        //Parent new child text 
                        this.addChild(parent, {
                            type: 'text',
                            value: '',
                            childs: []
                        });

                        //Go next
                        return this.iteract(parent, parent.childs[parent.childs.length - 1], string, index);
                    //Loop
                    case 'f':
                        //Parent new child loop
                        this.addChild(parent, {
                            type: 'loop',
                            value: '',
                            childs: []
                        });

                        //Loop node new child params
                        this.addChild(parent.childs[parent.childs.length - 1], {
                            type: 'params',
                            value: '',
                            childs: []
                        });

                        //Parse while loop not closed
                        index = this.iteract(parent.childs[parent.childs.length - 1], parent.childs[parent.childs.length - 1].childs[0], string, index+3);
                        this.addChild(parent, {
                            type: 'text',
                            value: '',
                            childs: []
                        });

                        //Go next
                        return this.iteract(parent, parent.childs[parent.childs.length - 1], string, index);
                    //If
                    case 'i':
                          //Parent new child if
                          this.addChild(parent, {
                            type: 'if',
                            value: '',
                            childs: []
                        });

                        //If node new child params
                        this.addChild(parent.childs[parent.childs.length - 1], {
                            type: 'params',
                            value: '',
                            childs: []
                        });

                        //Parse while if not closed
                        index = this.iteract(parent.childs[parent.childs.length - 1], parent.childs[parent.childs.length - 1].childs[0], string, index+3);
                        this.addChild(parent, {
                            type: 'text',
                            value: '',
                            childs: []
                        });

                        //Go next
                        return this.iteract(parent, parent.childs[parent.childs.length - 1], string, index);
                    //Just text
                    default:
                        node.value += ch;
                        break;
                }
            } else if(ch == '}' && nextCh == '}') {
                return index + 2;
            } else if(ch == ':' && nextCh == '!' && string[index+2] == '}') {
                return index + 3;
            } else if(ch == ':' && parent.type == 'if') {
                this.addChild(parent, {
                    type: 'else',
                    value: '',
                    childs: []
                });

                this.addChild(parent.childs[parent.childs.length - 1], {
                    type: 'text',
                    value: '',
                    childs: []
                });

                return this.iteract(parent.childs[parent.childs.length - 1], parent.childs[parent.childs.length - 1].childs[0], string, index + 1);
            } else {
                node.value += ch;
            }
        }

        return this;
    }

    parse(tree) {
        let t = this.tree[0];
        if(tree) {
            t = tree;
        }

        if(t.childs.length == 0) {
            return false;
        }

        t.childs.forEach(child => {
            if(child.type == 'text') {
                this.result += child.value;
                return;
            }

            if(child.type == 'variable') {
                this.result += eval(child.value);
                return;
            }

            if(child.type == 'loop') {
                let params = child.childs.find(el => el.type == 'params');
                if(!params) {
                    this.result += '!Can\'t find params!';
                    return;
                }

                let arr = eval(params.value[0]);
                let iteratorName = params.value[1];
                if(typeof arr === 'object') {
                    let keys = Object.keys(arr);
                    keys.forEach(key => {
                        window[iteratorName] = arr[key];
                        return this.parse(child);
                    });
                    return;
                } else if(Array.isArray(arr)) {
                    arr.forEach(item => {
                        window[iteratorName] = arr[key];
                        return this.parse(child);
                    });
                    return;
                }

                this.result += '!Wrong type of array!';
                return;
            }

            if(child.type == 'if') {
                let params = child.childs.find(el => el.type == 'params');
                if(!params) {
                    this.result += '!Can\'t find params!';
                    return;
                }

                if(eval(params.value[0])) {
                    return this.parse(child);
                } else {
                    let elsePart = child.childs.find(el => el.type == 'else');
                    if(elsePart) {
                        return this.parse(elsePart);
                    }
                }

                return;
            }
        });

        return this.result;
    }

    addChild(parent, child) {
        parent.childs.push(child);
    }

    setTree(tree) {
        this.tree = tree;
        return this;
    }

    getTree() {
        return this.tree;
    }

    getResult() {
        return this.result;
    }
}