// Listen for the 'alpine:init' event to set up the Alpine.js component and custom directive
document.addEventListener(
    "alpine:init",
    function setupAlpineBindings() {
        // Register a custom Alpine.js directive called 'template-outlet'
        Alpine.directive("template-outlet", TemplateOutletDirective);
    }
);

/**
* TemplateOutletDirective is a custom directive that clones and renders
* a given source template dynamically into the DOM.
*/
function TemplateOutletDirective(element, metadata, framework) {
    // Get the template reference (template element) we want to clone and render.
    var templateRef = framework.evaluate(metadata.expression);

    // Clone the template and get its root node (the first element child of the template's content).
    var clone = templateRef.content
        .cloneNode(true)
        .firstElementChild;

    // Copy the data stack from the template to the clone to ensure it uses the correct Alpine data context.
    clone._x_dataStack = Alpine.closestDataStack(element);

    // Create a comment hook in the DOM to replace the original element. This makes the DOM cleaner.
    var domHook = document.createComment(
        ` Template outlet hook (${metadata.expression}) with bindings (${element.getAttribute("x-data")}). `
    );
    domHook._template_outlet_ref = templateRef;
    domHook._template_outlet_clone = clone;

    // Use Alpine's `mutateDom` to manage the DOM manipulation without triggering Alpine's mutation observer.
    Alpine.mutateDom(function pauseMutationObserver() {
        // Insert the comment hook, followed by the cloned content into the DOM.
        element.after(domHook);
        domHook.after(clone);
        
        // Initialize the Alpine.js tree for the new clone (to enable Alpine bindings).
        Alpine.initTree(clone);

        // Remove the original element from the DOM and destroy its Alpine tree.
        element.remove();
        Alpine.destroyTree(element);
    });
}

/**
* `menuComponent` function defines a component to manage dynamic menus with various features.
* It handles adding, editing, deleting, moving, and rendering nested menus.
*/
function menuComponent() {
    return {
        // Array to hold the root menu items
        menus: [],
        
        // Array to hold the links (though it's not used in the provided methods)
        links: [],
        
        // Add a new menu either to the root menu or a specified parent menu
        addNewMenu(parent = null) {
            // If there's a parent, add to its `childs` array, else add to the root `menus` array
            parent ? parent.childs.push({
                title: 'New Menu',    // Default title for new menu
                link: '#',            // Default link for new menu
                key: Math.floor(100000 + Math.random() * 900000),  // Unique key for the menu
                childs: [],           // Nested menus (child menus)
                editing: false,       // Whether the menu is being edited
            }) : this.menus.push({
                title: 'New Menu',
                link: '#',
                key: Math.floor(100000 + Math.random() * 900000),
                childs: [],
                editing: false,
            });
            // Update menus after adding the new one
            this.updateMenus();
        },

        // Change the title of an existing menu
        changeMenuTitle(menu, value) {
            menu.title = value;  // Update the menu title
            // Update menus after the title change
            this.updateMenus();
        },

        // Change the link of a menu, allowing it to be set to a custom link
        changeMenuLink(menu, value, custom_link = false) {
            // Set the menu's link to custom link if specified
            menu.custom_link = value == 'custom_link' || custom_link;
            menu.link = (value == 'custom_link' ? menu.link : value);  // Update link if not custom_link
            // Update menus after the link change
            this.updateMenus();
        },

        // Delete an existing menu, either from the root or from a parent menu
        deleteMenu(menu, parent = null) {
            if (parent) {
                // If the menu has a parent, remove it from the parent's `childs` array
                const index = parent.childs.findIndex(child => child.key === menu.key);
                if (index !== -1) {
                    parent.childs.splice(index, 1);  // Remove the menu from the parent
                }
            } else {
                // If the menu doesn't have a parent, remove it from the root `menus` array
                const index = this.menus.findIndex(m => m.key === menu.key);
                if (index !== -1) {
                    this.menus.splice(index, 1);  // Remove the menu from root
                }
            }
            // Update menus after deletion
            this.updateMenus();
        },

        // Move a menu item up in the list (either within the root or a nested menu)
        moveUp(menu, parent = null) {
            if (parent) {
                // Find the index of the menu within its parent's `childs` array
                const index = parent.childs.findIndex(child => child.key === menu.key);
                if (index > 0) {
                    // Swap the menu with the one above it
                    [parent.childs[index - 1], parent.childs[index]] = [parent.childs[index], parent.childs[index - 1]];
                }
            } else {
                // Find the index of the menu within the root `menus` array
                const index = this.menus.findIndex(m => m.key === menu.key);
                if (index > 0) {
                    // Swap the menu with the one above it
                    [this.menus[index - 1], this.menus[index]] = [this.menus[index], this.menus[index - 1]];
                }
            }
            // Update menus after reordering
            this.updateMenus();
        },

        // Move a menu item down in the list (either within the root or a nested menu)
        moveDown(menu, parent = null) {
            if (parent) {
                // Find the index of the menu within its parent's `childs` array
                const index = parent.childs.findIndex(child => child.key === menu.key);
                if (index < parent.childs.length - 1) {
                    // Swap the menu with the one below it
                    [parent.childs[index], parent.childs[index + 1]] = [parent.childs[index + 1], parent.childs[index]];
                }
            } else {
                // Find the index of the menu within the root `menus` array
                const index = this.menus.findIndex(m => m.key === menu.key);
                if (index < this.menus.length - 1) {
                    // Swap the menu with the one below it
                    [this.menus[index], this.menus[index + 1]] = [this.menus[index + 1], this.menus[index]];
                }
            }
            // Update menus after reordering
            this.updateMenus();
        },

        // A simple method to log the current state of the menus (you can replace this with an API call or other functionality)
        updateMenus() {
            console.log(JSON.stringify(this.menus));  // Log the menus array to the console for debugging
        }
    };
}
