import { List, uuid } from "~/lib/types";
import ListItemElement from "./ListItemElement";
import AddItemElement from "./AddItemElement";
import { For, createMemo, createSignal, createEffect } from "solid-js";
import { useRtdbValue, db } from "@lib/db.client";
import { update, ref } from "firebase/database";

let lastTimeTyped = 0;

export default function ListElement(props: { list: List }) {
    const { value: remoteList } = useRtdbValue<List>(`lists/${props.list.id}`);
    const list = createMemo(() => remoteList() || props.list);

    const sortedItemIDs = createMemo(() => {
        const items = list().items || {};
        return Object.keys(items).sort((a, b) => items[a as uuid].createdAt - items[b as uuid].createdAt);
    });

    return (
        <div class="flex flex-col max-w-3xl mx-auto my-8">
            <div class="bg-gray-800 shadow-md rounded-lg p-6 transition-shadow hover:shadow-lg text-gray-100">
                <ul>
                    <For each={sortedItemIDs()}>{(itemId) =>
                        <ListItemElement item={list().items![itemId as uuid]} indentLevel={0} idstring={"lists/" + props.list.id + "/items/" + itemId} />
                    }
                    </For>
                </ul>
                <div class="mt-4 pt-4 border-t border-gray-700">
                    <AddItemElement idstring={`lists/${props.list.id}/items`} />
                </div>
            </div>
        </div>
    );
}
