import { List } from "~/lib/types";
import ListItemElement from "./ListItemElement";
import AddItemElement from "./AddItemElement";
import { Index, createMemo, createSignal, createEffect } from "solid-js";
import { useRtdbValue } from "@lib/db.client";

let lastTimeTyped = 0;

export default function ListElement(props: { list: List }) {
    const { value: remoteList } = useRtdbValue<List>(`lists/${props.list.id}`);
    const list = createMemo(() => remoteList() || props.list || { title: "Untitled", items: [] });
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
            </div>
        </div>
    );
}
