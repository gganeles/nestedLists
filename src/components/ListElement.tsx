import { List } from "~/lib/types";
import ListItemElement from "./ListItemElement";
import AddItemElement from "./AddItemElement";
import { Index, createMemo } from "solid-js";
import { useRtdbValue, db } from "@lib/db.client";
import { ref, remove } from "firebase/database";
import { useNavigate } from "@solidjs/router";

let lastTimeTyped = 0;

export default function ListElement(props: { list: List }) {
    const { value: remoteList } = useRtdbValue<List>(`lists/${props.list.id}`);
    const list = createMemo(() => remoteList() || props.list || { title: "Untitled", items: [] });
    const navigate = useNavigate();
    // Normalize items to ensure it is always an array and filter out nulls/undefined
    const items = createMemo(() => {
        const l = list();
        if (!l || !l.items) return [];
        return l.items;
    });

    return (
        <div class="flex flex-col max-w-3xl mx-auto my-8">
            <div class="bg-gray-800 shadow-md rounded-lg p-6 transition-shadow hover:shadow-lg text-gray-100">
                <ul>
                    <Index each={items()}>{(item, index) =>
                        <ListItemElement item={item()} indentLevel={0} idstring={"lists/" + props.list.id + "/items/" + index} parentList={items()} />
                    }
                    </Index>
                </ul>
                <div class="mt-4 pt-4 border-t border-gray-700">
                    <AddItemElement idstring={`lists/${props.list.id}/items`} parentList={items()} />
                </div>
                <div class="flex justify-center mt-4">
                    <button
                        class="flex flex-row ml-2 p-2 text-gray-300 hover:text-white transition-colors p-1 rounded-md hover:bg-red-600/90 bg-red-600/60"
                        title="Delete List"
                        onClick={(e) => {
                            e.preventDefault();
                            remove(ref(db, `lists/${props.list.id}`));
                            navigate("/");
                        }}
                    >
                        Delete List
                        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
