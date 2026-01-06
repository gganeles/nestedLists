import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { isServer } from "solid-js/web";

const firebaseConfig = {
    apiKey: "AIzaSyBp7GE1c-H8H5yFLG_y1shPMZKdq85_MUQ",
    authDomain: "nestedlists-95bb0.firebaseapp.com",
    databaseURL: "https://nestedlists-95bb0-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "nestedlists-95bb0",
    storageBucket: "nestedlists-95bb0.firebasestorage.app",
    messagingSenderId: "1031102545786",
    appId: "1:1031102545786:web:ae1504fa44a2e331eaa0c3",
    measurementId: "G-76DCRBDJ6Y"
};

let app;
let db: ReturnType<typeof getDatabase>;

if (!isServer) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getDatabase(app);
}

export { db };


import { createSignal, onCleanup, onMount } from "solid-js";
import { onValue, ref, set } from "firebase/database";


export function useRtdbValue<T>(path: string) {
    const [value, setValue] = createSignal<T | null>(null);

    onMount(() => {
        const r = ref(db, path);
        const unsub = onValue(r, (snap) => {
            setValue(() => (snap.exists() ? (snap.val() as T) : null));
        });
        onCleanup(unsub);
    });

    const write = (next: T) => set(ref(db, path), next);

    return { value, write };
}
