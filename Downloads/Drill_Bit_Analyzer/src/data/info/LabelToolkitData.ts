import {LabelType} from '../enums/LabelType';
import {ProjectType} from '../enums/ProjectType';

export interface ILabelToolkit {
    labelType: LabelType;
    headerText: string;
    imageSrc: string;
    imageAlt: string;
    projectType: ProjectType;
}

export const LabelToolkitData: ILabelToolkit[] = [
    {
        labelType: LabelType.IMAGE_RECOGNITION,
        headerText: 'Image recognition',
        imageSrc: 'ico/object.png',
        imageAlt: 'object',
        projectType: ProjectType.IMAGE_RECOGNITION,
    },
    {
        labelType: LabelType.RECT,
        headerText: 'Rect',
        imageSrc: 'ico/rectangle.png',
        imageAlt: 'rectangle',
        projectType: ProjectType.OBJECT_DETECTION,
    },
    {
        labelType: LabelType.FEEDBACK,
        headerText: 'Feedback',
        imageSrc: 'ico/point.png',
        imageAlt: 'point',
        projectType: ProjectType.OBJECT_DETECTION,
    },
];