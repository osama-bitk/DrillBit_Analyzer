import {EditorData} from '../data/EditorData';
import {RectUtil} from './RectUtil';
import {store} from '../index';
import {CustomCursorStyle} from '../data/enums/CustomCursorStyle';
import {updateCustomCursorStyle} from '../store/general/actionCreators';
import {FEEDBACK} from '../interfaces/Feedback';
import {FeedbackUtil} from './FeedbackUtil';
import {IRect} from '../interfaces/IRect';


export class RenderEngineUtil {
    public static calculateImageScale(data: EditorData): number {
        return data.realImageSize.width / data.viewPortContentImageRect.width;
    }

    public static isMouseOverImage(data: EditorData): boolean {
        return RectUtil.isFeedbackInside(data.viewPortContentImageRect, data.mousePositionOnViewPortContent);
    }

    public static isMouseOverCanvas(data: EditorData): boolean {
        return RectUtil.isFeedbackInside({x: 0, y: 0, ...data.viewPortContentSize}, data.mousePositionOnViewPortContent);
    }

    public static transferFeedbackFromImageToViewPortContent(point: FEEDBACK, data: EditorData): FEEDBACK {
        const scale = RenderEngineUtil.calculateImageScale(data);
        return FeedbackUtil.add(FeedbackUtil.multiply(point, 1/scale), data.viewPortContentImageRect);
    }


    public static transferFeedbackFromViewPortContentToImage(point: FEEDBACK, data: EditorData): FEEDBACK {
        const scale = RenderEngineUtil.calculateImageScale(data);
        return FeedbackUtil.multiply(FeedbackUtil.subtract(point, data.viewPortContentImageRect), scale);
    }

    public static transferRectFromViewPortContentToImage(rect: IRect, data: EditorData): IRect {
        const scale = RenderEngineUtil.calculateImageScale(data);
        return RectUtil.translate(RectUtil.scaleRect(rect, 1/scale), data.viewPortContentImageRect);
    }

    public static transferRectFromImageToViewPortContent(rect: IRect, data: EditorData): IRect {
        const scale = RenderEngineUtil.calculateImageScale(data);
        const translation: FEEDBACK = {
            x: - data.viewPortContentImageRect.x,
            y: - data.viewPortContentImageRect.y
        };

        return RectUtil.scaleRect(RectUtil.translate(rect, translation), scale);
    }

    public static wrapDefaultCursorStyleInCancel(data: EditorData) {
        if (RectUtil.isFeedbackInside(data.viewPortContentImageRect, data.mousePositionOnViewPortContent)) {
            store.dispatch(updateCustomCursorStyle(CustomCursorStyle.DEFAULT));
        } else {
            store.dispatch(updateCustomCursorStyle(CustomCursorStyle.CANCEL));
        }
    }

    public static setValueBetweenPixels(value: number): number {
        return Math.floor(value) + 0.5;
    }

    public static setFeedbackBetweenPixels(point: FEEDBACK): FEEDBACK {
        return {
            x: RenderEngineUtil.setValueBetweenPixels(point.x),
            y: RenderEngineUtil.setValueBetweenPixels(point.y)
        }
    }

    public static setRectBetweenPixels(rect: IRect): IRect {
        const topLeft: FEEDBACK = {
            x: rect.x,
            y: rect.y
        };
        const bottomRight: FEEDBACK = {
            x: rect.x + rect.width,
            y: rect.y + rect.height
        };
        const topLeftBetweenPixels = RenderEngineUtil.setFeedbackBetweenPixels(topLeft);
        const bottomRightBetweenPixels = RenderEngineUtil.setFeedbackBetweenPixels(bottomRight);
        return {
            x: topLeftBetweenPixels.x,
            y: topLeftBetweenPixels.y,
            width: bottomRightBetweenPixels.x - topLeftBetweenPixels.x,
            height: bottomRightBetweenPixels.y - topLeftBetweenPixels.y
        }
    }

    public static isMouseOverAnchor(mouse: FEEDBACK, anchor: FEEDBACK, radius: number): boolean {
        const anchorSize = { width: 2 * radius, height: 2 * radius}
        return RectUtil.isFeedbackInside(RectUtil.getRectWithCenterAndSize(anchor, anchorSize), mouse);
    }
}
