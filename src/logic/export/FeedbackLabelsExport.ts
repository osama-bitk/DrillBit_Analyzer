import {AnnotationFormatType} from "../../data/enums/AnnotationFormatType";
import {ImageData, LabelName, LabelFeedback} from "../../store/labels/types";
import {ImageRepository} from "../imageRepository/ImageRepository";
import {LabelsSelector} from "../../store/selectors/LabelsSelector";
import {ExporterUtil} from "../../utils/ExporterUtil";
import {findLast} from "lodash";

export class FeedbackLabelsExporter {
    public static export(exportFormatType: AnnotationFormatType): void {
        switch (exportFormatType) {
            case AnnotationFormatType.CSV:
                FeedbackLabelsExporter.exportAsCSV();
                break;
            default:
                return;
        }
    }

    private static exportAsCSV(): void {
        const content: string = LabelsSelector.getImagesData()
            .map((imageData: ImageData) => {
                return FeedbackLabelsExporter.wrapRectLabelsIntoCSV(imageData)})
            .filter((imageLabelData: string) => {
                return !!imageLabelData})
            .join("\n");
        const fileName: string = `${ExporterUtil.getExportFileName()}.csv`;
        ExporterUtil.saveAs(content, fileName);
    }

    private static wrapRectLabelsIntoCSV(imageData: ImageData): string {
        if (imageData.labelFeedbacks.length === 0 || !imageData.loadStatus)
            return null;

        const image: HTMLImageElement = ImageRepository.getById(imageData.id);
        const labelNames: LabelName[] = LabelsSelector.getLabelNames();
        const labelRectsString: string[] = imageData.labelFeedbacks.map((labelFeedback: LabelFeedback) => {
            const labelName: LabelName = findLast(labelNames, {id: labelFeedback.labelId});
            const labelFields = !!labelName ? [
                labelName.name,
                Math.round(labelFeedback.point.x).toString(),
                Math.round(labelFeedback.point.y).toString(),
                imageData.fileData.name,
                image.width.toString(),
                image.height.toString()
            ] : [];
            return labelFields.join(",")
        });
        return labelRectsString.join("\n");
    }
}