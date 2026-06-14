import type Crosmos from "crosmos";
import { readStore, writeStore } from "../lib/config.js";

export async function resolveSpaceId(client: Crosmos): Promise<string | null> {
    if (process.env.CROSMOS_SPACE_ID) return process.env.CROSMOS_SPACE_ID;

    const name = process.env.CROSMOS_SPACE_NAME;
    if (name) {
        const { spaces } = await client.spaces.list({ name });
        return spaces[0]?.id ?? null;
    }

    const store = readStore();
    if (store.spaceId) return store.spaceId;

    const { spaces } = await client.spaces.list();
    const id = spaces[0]?.id;
    if (!id) return null;

    writeStore({ ...store, spaceId: id });
    return id;
}
