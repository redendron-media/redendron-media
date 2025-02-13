import { createClient } from "@sanity/client";
import  imageUrlBuilder from "@sanity/image-url";

export const sanityClient = createClient({
    projectId: "h5na4piu", // Replace with your actual project ID
    dataset: "production",
    useCdn: true,
    apiVersion: "2024-02-01",
  });

  const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
    return builder.image(source)
}
