document.addEventListener(
    "alpine:init",
    function setupAlpineBindings() {

        Alpine.directive("template-outlet", TemplateOutletDirective);

    }
);
/**
* I clone and render the given source template.
*/
function TemplateOutletDirective(element, metadata, framework) {

    // Get the template reference that we want to clone and render.
    var templateRef = framework.evaluate(metadata.expression);

    // Clone the template and get the root node - this is the node that we will
    // inject into the DOM.
    var clone = templateRef.content
        .cloneNode(true)
        .firstElementChild;

    // For the clone, all I need to do at the moment is copy the datastack from the
    // template over to the clone. This way, even if the template doesn't have an "x-data"
    // attribute, I'll still have the right stack.
    clone._x_dataStack = Alpine.closestDataStack(element);

    // Instead of leaving the template in the DOM, we're going to swap the
    // template with a comment hook. This isn't necessary; but, I think it leaves
    // the DOM more pleasant looking.
    var domHook = document.createComment(
        ` Template outlet hook (${metadata.expression}) with bindings (${element.getAttribute("x-data")}). `
    );
    domHook._template_outlet_ref = templateRef;
    domHook._template_outlet_clone = clone;

    // Swap the template-outlet element with the hook and clone.
    // --
    // NOTE: Doing this inside the mutateDom() method will pause Alpine's internal
    // MutationObserver, which allows us to perform DOM manipulation without
    // triggering actions in the framework. Then, we can call initTree() and
    // destroyTree() to have explicitly setup and teardowm DOM node bindings.
    Alpine.mutateDom(
        function pauseMutationObserver() {

            element.after(domHook);
            domHook.after(clone);
            Alpine.initTree(clone);

            element.remove();
            Alpine.destroyTree(element);

        }
    );

}
function menuComponent() {
    return {
        menus: [],
        links: [],
        addNewMenu(parent = null) {
            parent ? parent.childs.push({
                title: 'New Menu',
                link: '#',
                key: Math.floor(100000 + Math.random() * 900000),
                childs: [],
                editing: false,
            }) : this.menus.push({
                title: 'New Menu',
                link: '#',
                key: Math.floor(100000 + Math.random() * 900000),
                childs: [],
                editing: false,
            });
            this.updateMenus();
        },
        changeMenuTitle(menu, value) {
            menu.title = value;
            this.updateMenus();
        },
        changeMenuLink(menu, value, custom_link = false) {
            menu.custom_link = value == 'custom_link' || custom_link;
            menu.link = (value == 'custom_link' ? menu.link : value);
            this.updateMenus();
        },
        deleteMenu(menu, parent = null) {
            if (parent) {
                // If the menu has a parent, remove it from the parent's `childs` array
                const index = parent.childs.findIndex(child => child.key === menu.key);
                if (index !== -1) {
                    parent.childs.splice(index, 1);
                }
            } else {
                // If the menu doesn't have a parent, remove it from the `menus` array
                const index = this.menus.findIndex(m => m.key === menu.key);
                if (index !== -1) {
                    this.menus.splice(index, 1);
                }
            }
            this.updateMenus();
        },
        moveUp(menu, parent = null) {
            if (parent) {
                // Find the menu within the parent's `childs` array
                const index = parent.childs.findIndex(child => child.key === menu.key);
                if (index > 0) {
                    // Swap with the previous menu
                    [parent.childs[index - 1], parent.childs[index]] = [parent.childs[index], parent.childs[index -
                        1]];
                }
            } else {
                // Find the menu within the root `menus` array
                const index = this.menus.findIndex(m => m.key === menu.key);
                if (index > 0) {
                    // Swap with the previous menu
                    [this.menus[index - 1], this.menus[index]] = [this.menus[index], this.menus[index - 1]];
                }
            }
            this.updateMenus();
        },

        // Move item down by swapping with the next item
        moveDown(menu, parent = null) {
            if (parent) {
                // Find the menu within the parent's `childs` array
                const index = parent.childs.findIndex(child => child.key === menu.key);
                if (index < parent.childs.length - 1) {
                    // Swap with the next menu
                    [parent.childs[index], parent.childs[index + 1]] = [parent.childs[index + 1], parent.childs[
                        index]];
                }
            } else {
                // Find the menu within the root `menus` array
                const index = this.menus.findIndex(m => m.key === menu.key);
                if (index < this.menus.length - 1) {
                    // Swap with the next menu
                    [this.menus[index], this.menus[index + 1]] = [this.menus[index + 1], this.menus[index]];
                }
            }
            this.updateMenus();

        },
        updateMenus() {
            console.log(JSON.stringify(this.menus));
        }
    };
}