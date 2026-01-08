import { useLocation, A, useNavigate } from "@solidjs/router";
import { useRtdbValue, db } from "@lib/db.client";
import { For, Show, createSignal, createEffect, createMemo, Accessor } from "solid-js";
import { List, uuid } from "~/lib/types";
import { update, ref, push, set } from "firebase/database";

let lastTimeTyped = 0;

function NavItem(props: { id: string, lists: Accessor<Record<string, List> | null> }) {
    const list = createMemo(() => props.lists()?.[props.id]);

    // Guard against list deletion
    if (!list()) return null;

    const location = useLocation();
    const navigate = useNavigate();
    const isActive = () => location.pathname === `/${props.id}`;

    const [title, setTitle] = createSignal(list()!.title);

    createEffect(() => {
        const currentList = list();
        if (currentList && Date.now() > lastTimeTyped && currentList.title !== title()) {
            setTitle(currentList.title);
        }
    });

    const handleInput = (e: InputEvent) => {
        const newTitle = (e.currentTarget as HTMLInputElement).value;
        setTitle(newTitle);
        lastTimeTyped = Date.now() + 200;
        update(ref(db, `lists/${props.id}`), { title: newTitle });
    };

    return (
        <li class={`group relative flex items-center border-b-2 h-full ${isActive() ? "border-white" : "border-transparent hover:border-gray-300"} mx-0 pr-4 pl-0 whitespace-nowrap transition-colors duration-200`}>
            {isActive() ? (
                <div class="relative pl-4 py-3">
                    <span class="invisible whitespace-pre font-medium text-lg py-3 border border-transparent">{title() || "Untitled"}</span>
                    <input
                        class="absolute inset-0 w-full h-full bg-transparent text-white font-medium text-lg focus:outline-none py-3 pl-4 border-none placeholder-white/70"
                        value={title()}
                        placeholder="Untitled"
                        onInput={handleInput}
                    />
                </div>
            ) : (
                <A href={`/${props.id}`} class="block pl-4 py-3 text-gray-200 hover:text-white font-medium text-lg transition-colors">
                    {title() || "Untitled"}
                </A>
            )}
        </li>
    );
}

export default function Nav() {
    const { value: lists } = useRtdbValue<Record<string, List>>("lists");

    return (
        <nav class="bg-sky-700 shadow-lg sticky top-0 z-50">
            <ul class="container mx-auto flex items-center px-2 text-gray-200 overflow-x-auto scroller-none">
                <Show when={lists()}>
                    <For each={Object.keys(lists()!)}>
                        {(listId) => <NavItem id={listId} lists={lists} />}
                    </For>
                </Show>
                <button
                    class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors shadow-md font-medium flex items-center whitespace-nowrap ml-1 self-center h-min"
                    onClick={() => {
                        const newListRef = push(ref(db, "lists"));
                        const newList = new List("New List");
                        newList.id = newListRef.key! as uuid;
                        set(newListRef, newList);
                    }}
                >
                    <span class="text-xl leading-none">+</span>
                    New List
                </button>
            </ul>
        </nav>
    );
}
