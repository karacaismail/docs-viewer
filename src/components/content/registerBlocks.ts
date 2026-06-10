// Open-Closed kayıt noktası — yeni block = yeni bileşen + bir satır (08 §2)
import { registerBlock } from "../../engine";
import { HeadingBlock, ParagraphBlock, CalloutBlock, DividerBlock, ListBlock, ImageBlock } from "./blocks/basicBlocks";
import { DefinitionListBlock, StepListBlock, ChecklistBlock, UseCaseBlock, CaseStudyBlock, CardGridBlock, LessonHeaderBlock } from "./blocks/listBlocks";
import { TableBlock, ComparisonTableBlock } from "./blocks/TableBlock";
import { CodeBlock } from "./blocks/CodeBlock";

export function registerCoreBlocks(): void {
  registerBlock("heading", HeadingBlock);
  registerBlock("paragraph", ParagraphBlock);
  registerBlock("callout", CalloutBlock);
  registerBlock("definitionList", DefinitionListBlock);
  registerBlock("stepList", StepListBlock);
  registerBlock("checklist", ChecklistBlock);
  registerBlock("table", TableBlock);
  registerBlock("codeBlock", CodeBlock);
  registerBlock("cardGrid", CardGridBlock);
  registerBlock("comparisonTable", ComparisonTableBlock);
  registerBlock("useCase", UseCaseBlock);
  registerBlock("caseStudy", CaseStudyBlock);
  registerBlock("divider", DividerBlock);
  registerBlock("image", ImageBlock);
  registerBlock("list", ListBlock);
  registerBlock("lessonHeader", LessonHeaderBlock);
}
