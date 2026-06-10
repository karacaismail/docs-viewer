// validateStaticData barrel'da yok: zod yalnız dev/test'te yüklenir (bundle bütçesi)
export { foldTurkish } from "./foldTurkish";
export { navigation, pagesIndex, glossaryTerms, loadSearchIndex, loadPageBlocks, loadTermDetail } from "./loadStaticData";
export { resolvePage, resolvePageById, resolveRef } from "./resolvePage";
export { resolveTerm, termsOfPage } from "./resolveTerms";
export { registerBlock, resolveBlock } from "./blockRegistry";
export { scrollToBlockAnchor } from "./scrollToBlockAnchor";
