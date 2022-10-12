import {Annotation, LabelName, LabelFeedback, LabelRect} from '../store/labels/types';
import { v4 as uuidv4 } from 'uuid';
import {find} from 'lodash';
import {IRect} from '../interfaces/IRect';
import {LabelStatus} from '../data/enums/LabelStatus';
import {FEEDBACK} from '../interfaces/Feedback';
import { sample } from 'lodash';
import {Settings} from '../settings/Settings';

export class LabelUtil {
    public static createLabelName(name: string): LabelName {
        return {
            id: uuidv4(),
            name,
            color: sample(Settings.LABEL_COLORS_PALETTE)
        }
    }

    public static createLabelRect(labelId: string, rect: IRect): LabelRect {
        return {
            id: uuidv4(),
            labelId,
            rect,
            isVisible: true,
            isCreatedByAI: false,
            status: LabelStatus.ACCEPTED,
            suggestedLabel: null
        }
    }

    public static createLabelFeedback(labelId: string, point: FEEDBACK): LabelFeedback {
        return {
            id: uuidv4(),
            labelId,
            point,
            isVisible: true,
            isCreatedByAI: false,
            status: LabelStatus.ACCEPTED,
            suggestedLabel: null
        }
    }

    public static toggleAnnotationVisibility<AnnotationType extends Annotation>(annotation: AnnotationType): AnnotationType {
        return {
            ...annotation,
            isVisible: !annotation.isVisible
        }
    }

    public static labelNamesIdsDiff(oldLabelNames: LabelName[], newLabelNames: LabelName[]): string[] {
        return oldLabelNames.reduce((missingIds: string[], labelName: LabelName) => {
            if (!find(newLabelNames, { 'id': labelName.id })) {
                missingIds.push(labelName.id);
            }
            return missingIds
        }, [])
    }
}
