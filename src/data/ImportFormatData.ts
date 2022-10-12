import {LabelType} from './enums/LabelType';
import {ILabelFormatData} from '../interfaces/ILabelFormatData';
import {AnnotationFormatType} from './enums/AnnotationFormatType';

export type ImportFormatDataMap = Record<LabelType, ILabelFormatData[]>

export const ImportFormatData: ImportFormatDataMap = {
    [LabelType.RECT]: [
        {
            type: AnnotationFormatType.COCO,
            label: 'Single file in COCO JSON format.'
        },
        {
            type: AnnotationFormatType.YOLO,
            label: 'Multiple files in YOLO format along with labels names definition - labels.txt file.'
        }
    ],
    [LabelType.FEEDBACK]: [],

    [LabelType.IMAGE_RECOGNITION]: []
}
