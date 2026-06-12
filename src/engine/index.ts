// validateStaticData barrel'da yok: zod yalnız dev/test'te yüklenir (bundle bütçesi)

export * from "./basePath";
export { registerBlock, resolveBlock } from "./blockRegistry";
export * from "./blocksToMarkdown";
export { foldTurkish } from "./foldTurkish";
export {
  glossaryTerms,
  loadPageBlocks,
  loadSearchIndex,
  loadTermDetail,
  navigation,
  pagesIndex,
} from "./loadStaticData";
export { resolvePage, resolvePageById, resolveRef } from "./resolvePage";
export { resolveTerm, termsOfPage } from "./resolveTerms";
export { scrollToBlockAnchor } from "./scrollToBlockAnchor";
