import ListElement from "../components/ListElement";
import { onMount, createSignal, Show, createEffect } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";

export default function Home() {
    const params = useParams();
    const navigate = useNavigate();
    const [list, setList] = createSignal<any>(null);
    const [ready, setReady] = createSignal(false);
    const [mounted, setMounted] = createSignal(false);

    onMount(() => {
        setMounted(true);
    });

    createEffect(async () => {
        if (!mounted()) return;

        const id = params.id;
        setReady(false);
        setList(null);

        const { db } = await import("@lib/db.client"); // ensures client-only
        const { ref, get, child } = await import("firebase/database");
        const { List } = await import("~/lib/types");

        if (id) {
            // Fetch existing list
            const snapshot = await get(child(ref(db), `lists/${id}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const newList = new List(data.title);
                Object.assign(newList, data);
                setList(newList);
            }
        }

        setReady(true);
    });

    return (
        <Show when={mounted()}>
            <main class="text-center mx-auto text-gray-700 p-4">
                <Show when={ready()} fallback={<div>Loading...</div>}>
                    <Show when={list()} fallback={<div>Pick a list to get started</div>}>
                        <ListElement list={list()} />
                    </Show>
                </Show>
            </main>
        </Show>
    );
}
