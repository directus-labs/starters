
import { query, getRequestEvent } from '$app/server';
import { fetchPageData, fetchSiteData } from './fetchers';


export const getSiteData = query(async () => {
    const event = getRequestEvent();
    const data = await fetchSiteData(event.fetch);
    return data
})


export const getPage = query("unchecked", async (slug: string) => {
    const event = getRequestEvent();
    console.log("slug", slug)
    const data = await fetchPageData(slug, 1, event.fetch);
    return data

})