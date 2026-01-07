import { createSignal, onMount } from "solid-js";
import { ListItem } from "~/lib/types";
import { db } from "@lib/db.client";
import { ref, set } from "firebase/database";

export default function AddItemElement(props: { idstring: string, onBlur?: () => void, parentList: ListItem[] }) {
    const [text, setText] = createSignal("");
    let inputRef: HTMLInputElement | undefined;

    onMount(() => setTimeout(() => inputRef?.focus(), 0));

    const addItem = async () => {
        if (!text()) return;
        const newItem = new ListItem(text());

        // Handle potential dictionary-to-array conversion or safety check
        let list: ListItem[];
        if (Array.isArray(props.parentList)) {
            list = [...props.parentList];
        } else if (props.parentList && typeof props.parentList === 'object') {
            // Convert dictionary to array if necessary
            list = Object.values(props.parentList);
        } else {
            list = [];
        }

        list.push(newItem);
        await set(ref(db, `${props.idstring}`), list);
        setText("");
    };

    return (
        <div class="flex flex-row items-center mt-3 mb-1">
            <button
                class="mr-3 text-sky-500 hover:text-sky-400 p-1 rounded-full hover:bg-sky-900/50 transition-colors"
                onClick={addItem}
                title="Add Item"
                onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking button
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg>
            </button>
            <input
                ref={inputRef}
                autofocus
                onBlur={props.onBlur}
                type="text"
                class="w-full bg-transparent border-b-2 border-gray-600 focus:border-sky-500 focus:outline-none text-gray-200 py-1 transition-colors hover:border-gray-500 placeholder-gray-500"
                placeholder="Add item..."
                value={text()}
                onInput={(e) => setText(e.currentTarget.value)}
                onKeyDown={(e) => e.key == "Escape" && props.onBlur && props.onBlur() || e.key === "Enter" && addItem()}
            />
        </div>
    );
}
