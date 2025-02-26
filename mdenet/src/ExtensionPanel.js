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

    getTitle(){
        return this.title;
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