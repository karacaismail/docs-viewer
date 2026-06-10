import { navigation } from "../../engine";

export { navigation };

export function useFirstSlugOf() {
  return (categoryId: string): string => {
    const c = navigation.categories.find((x) => x.id === categoryId);
    return c?.groups[0]?.items[0]?.slug ?? navigation.categories[0].groups[0].items[0].slug;
  };
}
