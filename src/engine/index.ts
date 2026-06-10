// validateStaticData barrel'da yok: zod yalnız dev/test'te yüklenir (bundle bütçesi)

export { registerBlock, resolveBlock } from "./blockRegistry";
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
