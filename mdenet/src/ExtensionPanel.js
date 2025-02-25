class ExtensionPanel{

    id;
    visible;
    type;
    title;
    buttons;
    icon;

    constructor(id){
        this.id = id;
    }

    setTitle(title){
        this.title = title;
    }

    addButtons(buttons){
        this.buttons = buttons;
    }

    setIcon(icon){
        this.icon = icon;
    }

    getId(){
        return this.id;
    }
}

module.exports = ExtensionPanel;