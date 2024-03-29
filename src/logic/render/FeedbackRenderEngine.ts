import {IRect} from '../../interfaces/IRect';
import {RenderEngineSettings} from '../../settings/RenderEngineSettings';
import {FEEDBACK} from '../../interfaces/Feedback';
import {CanvasUtil} from '../../utils/CanvasUtil';
import {store} from '../../index';
import {ImageData, LabelFeedback} from '../../store/labels/types';
import {
    updateActiveLabelId,
    updateFirstLabelCreatedFlag,
    updateHighlightedLabelId,
    updateImageDataById
} from '../../store/labels/actionCreators';
import {FeedbackUtil} from '../../utils/FeedbackUtil';
import {RectUtil} from '../../utils/RectUtil';
import {DrawUtil} from '../../utils/DrawUtil';
import {updateCustomCursorStyle} from '../../store/general/actionCreators';
import {CustomCursorStyle} from '../../data/enums/CustomCursorStyle';
import {LabelsSelector} from '../../store/selectors/LabelsSelector';
import {EditorData} from '../../data/EditorData';
import {BaseRenderEngine} from './BaseRenderEngine';
import {RenderEngineUtil} from '../../utils/RenderEngineUtil';
import {LabelType} from '../../data/enums/LabelType';
import {EditorActions} from '../actions/EditorActions';
import {EditorModel} from '../../staticModels/EditorModel';
import {GeneralSelector} from '../../store/selectors/GeneralSelector';
import {LabelStatus} from '../../data/enums/LabelStatus';
import {Settings} from '../../settings/Settings';
import {LabelUtil} from '../../utils/LabelUtil';
import {RectAnchor} from '../../data/RectAnchor';

export class FeedbackRenderEngine extends BaseRenderEngine {

    // =================================================================================================================
    // STATE
    // =================================================================================================================
    private startCreateRectPoint: FEEDBACK;
    private startResizeRectAnchor: RectAnchor;
    public constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.labelType = LabelType.FEEDBACK;
    }

    // =================================================================================================================
    // EVENT HANDLERS
    // =================================================================================================================

    public mouseDownHandler(data: EditorData): void {
        // console.log(LabelFeedback.labelid)

        const isMouseOverImage: boolean = RenderEngineUtil.isMouseOverImage(data);
        const isMouseOverCanvas: boolean = RenderEngineUtil.isMouseOverCanvas(data);
        
        if (isMouseOverCanvas) {
            const LabelFeedback: LabelFeedback = this.getLabelFeedbackUnderMouse(data.mousePositionOnViewPortContent, data);
            if (!!LabelFeedback) {
                const FeedbackOnCanvas: FEEDBACK = RenderEngineUtil.transferFeedbackFromImageToViewPortContent(LabelFeedback.point, data);
                const FeedbackBetweenPixels = RenderEngineUtil.setFeedbackBetweenPixels(FeedbackOnCanvas);
                const handleRect: IRect = RectUtil.getRectWithCenterAndSize(FeedbackBetweenPixels, RenderEngineSettings.anchorHoverSize);
                const anchorUnderMouse: RectAnchor = this.getAnchorUnderMouseByRect(handleRect, data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            if (!!anchorUnderMouse && LabelFeedback.status === LabelStatus.ACCEPTED) {
                    store.dispatch(updateActiveLabelId(LabelFeedback.id));
                    this.startRectResize(anchorUnderMouse);
                } else {
                    if (!!LabelsSelector.getHighlightedLabelId())
                        store.dispatch(updateActiveLabelId(LabelsSelector.getHighlightedLabelId()));
                    else
                        this.startRectCreation(data.mousePositionOnViewPortContent);
                }


                if (RectUtil.isFeedbackInside(handleRect, data.mousePositionOnViewPortContent)) {
                    store.dispatch(updateActiveLabelId(LabelFeedback.id));
                    EditorActions.setViewPortActionsDisabledStatus(true);
                    return;
                } else {
                    store.dispatch(updateActiveLabelId(null));
                    const FeedbackOnImage: FEEDBACK = RenderEngineUtil.setFeedbackBetweenPixels(data.mousePositionOnViewPortContent);
                    this.addFeedbackLabel(FeedbackOnImage);
                }
            } else if (isMouseOverImage) {
                const FeedbackOnImage: FEEDBACK = RenderEngineUtil.transferFeedbackFromViewPortContentToImage(data.mousePositionOnViewPortContent, data);
                this.addFeedbackLabel(FeedbackOnImage);
            }
        }
        
    }

    public mouseUpHandler(data: EditorData): void {
        if (this.isInProgress()) {
            const mousePositionSnapped: FEEDBACK = RectUtil.snapFeedbackToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            const activeLabelFeedback: LabelFeedback = LabelsSelector.getActiveFeedbackLabel();
            const FeedbackSnapped: FEEDBACK = RectUtil.snapFeedbackToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            const FeedbackOnImage: FEEDBACK = RenderEngineUtil.transferFeedbackFromViewPortContentToImage(FeedbackSnapped, data);
            if (!!this.startCreateRectPoint && !FeedbackUtil.equals(this.startCreateRectPoint, mousePositionSnapped)) {

                const minX: number = Math.min(this.startCreateRectPoint.x, mousePositionSnapped.x);
                const minY: number = Math.min(this.startCreateRectPoint.y, mousePositionSnapped.y);
                const maxX: number = Math.max(this.startCreateRectPoint.x, mousePositionSnapped.x);
                const maxY: number = Math.max(this.startCreateRectPoint.y, mousePositionSnapped.y);

                const rect = {x: minX, y: minY, width: maxX - minX, height: maxY - minY};
                this.addFeedbackLabel(RenderEngineUtil.transferRectFromImageToViewPortContent(rect, data));
            }
            const imageData = LabelsSelector.getActiveImageData();

            imageData.labelFeedbacks = imageData.labelFeedbacks.map((LabelFeedback: LabelFeedback) => {
                if (LabelFeedback.id === activeLabelFeedback.id) {
                    return {
                        ...LabelFeedback,
                        FEEDBACK: FeedbackOnImage
                    };
                }
                return LabelFeedback;
            });
            store.dispatch(updateImageDataById(imageData.id, imageData));
        }
        EditorActions.setViewPortActionsDisabledStatus(false);
    }

    public mouseMoveHandler(data: EditorData): void {
        const isOverImage: boolean = RenderEngineUtil.isMouseOverImage(data);
        if (isOverImage) {
            const LabelFeedback: LabelFeedback = this.getLabelFeedbackUnderMouse(data.mousePositionOnViewPortContent, data);
            if (!!LabelFeedback) {
                if (LabelsSelector.getHighlightedLabelId() !== LabelFeedback.id) {
                    store.dispatch(updateHighlightedLabelId(LabelFeedback.id))
                }
            } else {
                if (LabelsSelector.getHighlightedLabelId() !== null) {
                    store.dispatch(updateHighlightedLabelId(null))
                }
            }
        }
    }

    // =================================================================================================================
    // RENDERING
    // =================================================================================================================

    public render(data: EditorData): void {
        const activeLabelId: string = LabelsSelector.getActiveLabelId();
        const highlightedLabelId: string = LabelsSelector.getHighlightedLabelId();
        const imageData: ImageData = LabelsSelector.getActiveImageData();
        if (imageData) {
            imageData.labelFeedbacks.forEach((LabelFeedback: LabelFeedback) => {
                if (LabelFeedback.isVisible) {
                    if (LabelFeedback.id === activeLabelId) {
                        console.log(LabelFeedback.labelId)
                        if (this.isInProgress()) {
                            const FEEDBACKSnapped: FEEDBACK = RectUtil.snapFeedbackToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
                            const FEEDBACKBetweenPixels: FEEDBACK = RenderEngineUtil.setFeedbackBetweenPixels(FEEDBACKSnapped);
                            const anchorColor: string = BaseRenderEngine.resolveLabelAnchorColor(true);
                            DrawUtil.drawCircleWithFill(this.canvas, FEEDBACKBetweenPixels, Settings.RESIZE_HANDLE_DIMENSION_PX/2, anchorColor)
                        } else {
                            this.renderFeedback(LabelFeedback, true, data);
                        }
                    } else {
                        this.renderFeedback(LabelFeedback, LabelFeedback.id === activeLabelId || LabelFeedback.id === highlightedLabelId, data);
                    }
                }
            });
        }
        this.updateCursorStyle(data);
    }

    private getAnchorUnderMouseByRect(rect: IRect, mousePosition: FEEDBACK, imageRect: IRect): RectAnchor {
        const rectAnchors: RectAnchor[] = RectUtil.mapRectToAnchors(rect);
        for (let i = 0; i < rectAnchors.length; i++) {
            const anchorRect: IRect = RectUtil.translate(RectUtil.getRectWithCenterAndSize(rectAnchors[i].position, RenderEngineSettings.anchorHoverSize), imageRect);
            if (!!mousePosition && RectUtil.isFeedbackInside(anchorRect, mousePosition)) {
                return rectAnchors[i];
            }
        }
        return null;
    }

    private renderFeedback(LabelFeedback: LabelFeedback, isActive: boolean, data: EditorData) {
        const FeedbackOnImage: FEEDBACK = RenderEngineUtil.transferFeedbackFromImageToViewPortContent(LabelFeedback.point, data);
        const FeedbackBetweenPixels = RenderEngineUtil.setFeedbackBetweenPixels(FeedbackOnImage);
        const anchorColor: string = BaseRenderEngine.resolveLabelAnchorColor(isActive);
        DrawUtil.drawCircleWithFill(this.canvas, FeedbackBetweenPixels, Settings.RESIZE_HANDLE_DIMENSION_PX/2, anchorColor)
    }

    private updateCursorStyle(data: EditorData) {
        if (!!this.canvas && !!data.mousePositionOnViewPortContent && !GeneralSelector.getImageDragModeStatus()) {
            const LabelFeedback: LabelFeedback = this.getLabelFeedbackUnderMouse(data.mousePositionOnViewPortContent, data);
            if (!!LabelFeedback && LabelFeedback.status === LabelStatus.ACCEPTED) {
                const FEEDBACKOnCanvas: FEEDBACK = RenderEngineUtil.transferFeedbackFromImageToViewPortContent(LabelFeedback.point, data);
                const FEEDBACKBetweenPixels = RenderEngineUtil.setFeedbackBetweenPixels(FEEDBACKOnCanvas);
                const handleRect: IRect = RectUtil.getRectWithCenterAndSize(FEEDBACKBetweenPixels, RenderEngineSettings.anchorHoverSize);
                if (RectUtil.isFeedbackInside(handleRect, data.mousePositionOnViewPortContent)) {
                    store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
                    return;
                }
            } else if (this.isInProgress()) {
                store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
                return;
            }

            if (RectUtil.isFeedbackInside({x: 0, y: 0, ...CanvasUtil.getSize(this.canvas)}, data.mousePositionOnViewPortContent)) {
                RenderEngineUtil.wrapDefaultCursorStyleInCancel(data);
                this.canvas.style.cursor = 'none';
            } else {
                this.canvas.style.cursor = 'default';
            }
        }
    }

    // =================================================================================================================
    // HELPERS
    // =================================================================================================================

    public isInProgress(): boolean {
        return EditorModel.viewPortActionsDisabled;
    }

    private getLabelFeedbackUnderMouse(mousePosition: FEEDBACK, data: EditorData): LabelFeedback {
        const labelFeedbacks: LabelFeedback[] = LabelsSelector
            .getActiveImageData()
            .labelFeedbacks
            .filter((LabelFeedback: LabelFeedback) => LabelFeedback.isVisible);
        for (const LabelFeedback of labelFeedbacks) {
            const FEEDBACKOnCanvas: FEEDBACK = RenderEngineUtil.transferFeedbackFromImageToViewPortContent(LabelFeedback.point, data);
            const handleRect: IRect = RectUtil.getRectWithCenterAndSize(FEEDBACKOnCanvas, RenderEngineSettings.anchorHoverSize);
            if (RectUtil.isFeedbackInside(handleRect, mousePosition)) {
                return LabelFeedback;
            }
        }
        return null;
    }

    private addFeedbackLabel = (FEEDBACK: FEEDBACK) => {
        const activeLabelId = LabelsSelector.getActiveLabelNameId();
        const imageData: ImageData = LabelsSelector.getActiveImageData();
        const LabelFeedback: LabelFeedback = LabelUtil.createLabelFeedback(activeLabelId, FEEDBACK);
        imageData.labelFeedbacks.push(LabelFeedback);
        store.dispatch(updateImageDataById(imageData.id, imageData));
        store.dispatch(updateFirstLabelCreatedFlag(true));
        store.dispatch(updateActiveLabelId(LabelFeedback.id));
    };


    private startRectCreation(mousePosition: FEEDBACK) {
        this.startCreateRectPoint = mousePosition;
        store.dispatch(updateActiveLabelId(null));
        EditorActions.setViewPortActionsDisabledStatus(true);
    }

    private startRectResize(activatedAnchor: RectAnchor) {
        this.startResizeRectAnchor = activatedAnchor;
        EditorActions.setViewPortActionsDisabledStatus(true);
    }

    private endRectTransformation() {
        this.startCreateRectPoint = null;
        this.startResizeRectAnchor = null;
        EditorActions.setViewPortActionsDisabledStatus(false);
    }


}
