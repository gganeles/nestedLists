export type uuid = `${string}-${string}-${string}-${string}-${string}`;

export interface Items {
    [key: uuid]: ListItem;
}

export class ListItem {
    id: uuid;
    text: string;
    completed: boolean;
    children: Items = {};
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

    addChild(text: string): ListItem {
        const children = this.getChildren();
        const newItem = new ListItem(text);
        children[newItem.id] = newItem;
        return children[newItem.id];
    }

    getSortedChildren(): ListItem[] {
        const children = this.getChildren();
        return Object.values(children).sort((a, b) => a.createdAt - b.createdAt);
    }
}

export class List {
    title: string;
    id: uuid
    items: Items = {};

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
        items[newItem.id] = newItem;
        return items[newItem.id];
    }

    getSortedItems(): ListItem[] {
        const items = this.getItems();
        return Object.values(items).sort((a, b) => a.createdAt - b.createdAt);
    }
}