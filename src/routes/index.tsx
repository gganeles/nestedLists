import List from "../components/List";
import { newTab, newItem } from "~/lib/utils";

export default function Home() {
    let list = newTab("Sample List");
    list.items.push(newItem("Sample Item 1"));
    list.items.push(newItem("Sample Item 2"));
    return (
        <main class="text-center mx-auto text-gray-700 p-4">
            No list is selected. Please select a list from the top.
            <List items={list.items} />
        </main>
    );
}
