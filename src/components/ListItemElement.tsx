import { ListItem, uuid } from "~/lib/types";
import { Index, Show, createMemo, createSignal, createEffect, onCleanup, children } from "solid-js";
import { useRtdbValue, db } from "@lib/db.client";
import { update, set, ref, remove } from "firebase/database";
import AddItemElement from "./AddItemElement";

let lastTimeTyped = 0;
// Global signal to track which item should be focused
// This allows us to focus newly created items from anywhere
export const [focusTarget, setFocusTarget] = createSignal<string | null>(null);

export default function ListItemElement(props: { item: ListItem, indentLevel: number, idstring: string, parentList: ListItem[] }) {

    const { value: remoteItem } = useRtdbValue<ListItem>(props.idstring);

    const item = createMemo(() => remoteItem() || props.item);
    // Extract the UUID from the idstring (last segment)
    //const itemId = createMemo(() => props.idstring.split("/").pop()!);


    const [text, setText] = createSignal(item()?.text || "");
    const [showAddChild, setShowAddChild] = createSignal(false);
    let inputRef: HTMLInputElement | undefined;

    createEffect(() => {
        const currentItem = item();
        if (!currentItem) return;
        const currentText = currentItem.text;
        if (Date.now() > lastTimeTyped && currentText !== text()) {
            setText(currentText);
        }
    });

    // Focus the input if it matches the focusTarget
    createEffect(() => {
        const currentItem = item();
        if (!currentItem) return;
        if (focusTarget() === currentItem.id && inputRef) {
            inputRef.focus();
            setFocusTarget(null); // Clear target after focusing
        }
    });


    const handleKeyDown = async (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const pathSegments = props.idstring.split("/");
            const itemIndex = pathSegments.pop();
            const parentPath = pathSegments.join("/");

            // Create a safe copy of the parent list to modify, converting object to array if needed
            let currentList: ListItem[];
            if (Array.isArray(props.parentList)) {
                currentList = [...props.parentList];
            } else if (props.parentList && typeof props.parentList === 'object') {
                currentList = Object.values(props.parentList);
            } else {
                currentList = [];
            }
            const newIndex = parseInt(itemIndex!) + 1;
            const newItem = new ListItem("");

            // Insert the new item into the array
            currentList.splice(newIndex, 0, newItem);

            // Save the updated list to the database
            await set(ref(db, parentPath), currentList);
            setFocusTarget(newItem.id);
        }

        return;
    }


    const handleInput = (e: InputEvent) => {
        const newText = (e.currentTarget as HTMLInputElement).value;
        setText(newText);
        lastTimeTyped = Date.now() + 200;
        update(ref(db, props.idstring), { text: newText });
    };

    const deleteItem = () => {
        const parentPath = props.idstring.split("/").slice(0, -1).join("/");
        // Create a safe copy of the parent list to modify, converting object to array if needed
        const currentList: ListItem[] = props.parentList;
        const itemIndex = currentList.findIndex(i => i.id === item().id);
        if (itemIndex === -1) return;
        currentList.splice(itemIndex, 1);
        setFocusTarget(null);
        set(ref(db, parentPath), currentList);
    };

    return (
        <li
            style={
                {
                    "padding-left": `${(props.indentLevel ? "2" : "0")}rem`
                }
            }
            class={`rounded-md ${item()?.children?.length ? "pt-2" : "py-1.5"} text-left`}>
            <div class='flex flex-row items-center group relative'>
                <button
                    class={`mr-3 w-6 h-5 rounded-sm border flex items-center justify-center transition-colors ${item()?.completed
                        ? "bg-slate-600 border-slate-600 text-white"
                        : "border-gray-500 hover:border-gray-400 bg-transparent"
                        }`}
                    onClick={() => item() && update(ref(db, props.idstring), { completed: !item()!.completed })}
                >
                    <Show when={item()?.completed}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </Show>
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    class={"w-full bg-transparent text-gray-200 border-b border-transparent focus:border-sky-500 focus:outline-none py-1 transition-colors placeholder-gray-500 " + (item()?.completed ? " line-through text-gray-500" : "")}
                    value={text()}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                />
                <div class="flex flex-row items-center ml-2 right-2 bg-gray-800/80 backdrop-blur-sm rounded shadow-sm">
                    <button
                        onClick={() => setShowAddChild(!showAddChild())}
                        class="text-gray-400 hover:text-sky-400 p-1.5 rounded-full hover:bg-sky-900/50 transition-colors"
                        title="Add Child"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg>
                    </button>
                    <button
                        onClick={deleteItem}
                        class="text-gray-400 hover:text-red-400 p-1.5 rounded-full hover:bg-red-900/50 transition-colors"
                        title="Delete Item"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                    </button>
                </div>
            </div>



            <Show when={item().children?.length}>
                <ul
                    class="flex flex-col pt-2"
                >
                    <Index each={(item()?.children || []).filter(i => !!i)}>{(child, index) =>
                        <ListItemElement item={child()} indentLevel={props.indentLevel + 1} idstring={props.idstring + "/children/" + index} parentList={item()?.children || []} />
                    }
                    </Index>
                </ul>
            </Show>

            <Show when={showAddChild()}>
                <div style={{ "padding-left": "2rem" }}>
                    <AddItemElement
                        idstring={props.idstring + "/children"}
                        onBlur={() => setShowAddChild(false)}
                        parentList={item().children}
                    />
                </div>
            </Show>
        </li >
    );
}