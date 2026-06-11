// Open-Closed kayıt noktası — yeni block = yeni bileşen + bir satır (08 §2)
import { registerBlock } from "../../engine";
import {
  CalloutBlock,
  DividerBlock,
  HeadingBlock,
  ImageBlock,
  ListBlock,
  ParagraphBlock,
} from "./blocks/basicBlocks";
import { CodeBlock } from "./blocks/CodeBlock";
import {
  CardGridBlock,
  CaseStudyBlock,
  ChecklistBlock,
  DefinitionListBlock,
  LessonHeaderBlock,
  StepListBlock,
  UseCaseBlock,
} from "./blocks/listBlocks";
import { ComparisonTableBlock, TableBlock } from "./blocks/TableBlock";
import { WbsChartBlock } from "./blocks/WbsChartBlock";

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
  registerBlock("wbsChart", WbsChartBlock);
}
