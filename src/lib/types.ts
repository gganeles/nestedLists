export type uuid = `${string}-${string}-${string}-${string}-${string}`;

export type Items = ListItem[];


export class ListItem {
    id: uuid;
    text: string;
    completed: boolean;
    children: Items = [];
    createdAt: number;

    constructor(
        text: string
    ) {
        this.id = crypto.randomUUID() as uuid;
        this.text = text;
        this.completed = false;
        this.createdAt = Date.now();
    }

    getChildren(): Items {
        return this.children;
    }

    findChildIndex(id: uuid): number {
        return this.getChildren().findIndex(child => child.id === id);
    }

    addChild(text: string): ListItem {
        const children = this.getChildren();
        const newItem = new ListItem(text);
        children.push(newItem);
        return newItem;
    }

    addItemAt(index: number, text: string): ListItem {
        const children = this.getChildren();
        const newItem = new ListItem(text);
        children.splice(index, 0, newItem);
        return newItem;
    }
}

export class List {
    title: string;
    id: uuid
    items: Items = [];

    constructor(
        title: string,
    ) {
        this.id = crypto.randomUUID() as uuid;
        this.title = title;
    }

    getItems(this: List): Items {
        return this.items;
    }

    addItem(text: string): ListItem {
        const items = this.getItems();
        const newItem = new ListItem(text);
        items.push(newItem);
        return newItem;
    }

    addItemAt(index: number, text: string): ListItem {
        const items = this.getItems();
        const newItem = new ListItem(text);
        items.splice(index, 0, newItem);
        return newItem;
    }

    findItemById(id: uuid): ListItem | null {
        function recursiveSearch(items: Items): ListItem | null {
            for (const item of items) {
                if (item.id === id) {
                    return item;
                }
                const foundInChildren = recursiveSearch(item.getChildren());
                if (foundInChildren) {
                    return foundInChildren;
                }
            }
            return null;
        }

        return recursiveSearch(this.getItems());
    }
}
