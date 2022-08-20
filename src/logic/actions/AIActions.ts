import {LabelType} from '../../data/enums/LabelType';
import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {AIObjectDetectionActions} from './AIObjectDetectionActions';
import {ImageData} from '../../store/labels/types';

export class AIActions {
    public static excludeRejectedLabelNames(suggestedLabels: string[], rejectedLabels: string[]): string[] {
        return suggestedLabels.reduce((acc: string[], label: string) => {
            if (!rejectedLabels.includes(label)) {
                acc.push(label)
            }
            return acc;
        }, [])
    }

    public static detect(imageId: string, image: HTMLImageElement): void {
        const activeLabelType: LabelType = LabelsSelector.getActiveLabelType();

        switch (activeLabelType) {
            case LabelType.RECT:
                AIObjectDetectionActions.detectRects(imageId, image);
                break;
        }
    }

    public static rejectAllSuggestedLabels(imageData: ImageData) {
        const activeLabelType: LabelType = LabelsSelector.getActiveLabelType();

        switch (activeLabelType) {
            case LabelType.RECT:
                AIObjectDetectionActions.rejectAllSuggestedRectLabels(imageData);
                break;
        }
    }

    public static acceptAllSuggestedLabels(imageData: ImageData) {
        const activeLabelType: LabelType = LabelsSelector.getActiveLabelType();
        switch (activeLabelType) {
            case LabelType.RECT:
                AIObjectDetectionActions.acceptAllSuggestedRectLabels(imageData);
                break;
        }
    }
}