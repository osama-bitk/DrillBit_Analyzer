import {EditorData} from "../../data/EditorData";
import {MouseEventUtil} from "../../utils/MouseEventUtil";
import {EventType} from "../../data/enums/EventType";
import {store} from "../../index";
import {updateCustomCursorStyle} from "../../store/general/actionCreators";
import {CustomCursorStyle} from "../../data/enums/CustomCursorStyle";
import {EditorModel} from "../../staticModels/EditorModel";
import {FEEDBACK} from "../../interfaces/Feedback";
import {FeedbackUtil} from "../../utils/FeedbackUtil";
import {ViewPortActions} from "../actions/ViewPortActions";

export class ViewPortHelper {
    private startScrollPosition: FEEDBACK;
    private mouseStartPosition: FEEDBACK;

    public update(data: EditorData): void {
        if (!!data.event) {
            switch (MouseEventUtil.getEventType(data.event)) {
                case EventType.MOUSE_MOVE:
                    this.mouseMoveHandler(data);
                    break;
                case EventType.MOUSE_UP:
                    this.mouseUpHandler(data);
                    break;
                case EventType.MOUSE_DOWN:
                    this.mouseDownHandler(data);
                    break;
                default:
                    break;
            }
        }
    }

    private mouseDownHandler(data: EditorData) {
        const event = data.event as MouseEvent;
        this.startScrollPosition = data.absoluteViewPortContentScrollPosition;
        this.mouseStartPosition = {x: event.screenX, y: event.screenY};

        store.dispatch(updateCustomCursorStyle(CustomCursorStyle.GRABBING));
        EditorModel.canvas.style.cursor = "none";
    }

    private mouseUpHandler(data: EditorData) {
        this.startScrollPosition = null;
        this.mouseStartPosition = null;
        store.dispatch(updateCustomCursorStyle(CustomCursorStyle.GRAB));
        EditorModel.canvas.style.cursor = "none";
    }

    private mouseMoveHandler(data: EditorData) {
        if (!!this.startScrollPosition && !!this.mouseStartPosition) {
            const event = data.event as MouseEvent;
            const currentMousePosition: FEEDBACK = {x: event.screenX, y: event.screenY};
            const mousePositionDelta: FEEDBACK = FeedbackUtil.subtract(currentMousePosition, this.mouseStartPosition);
            const nextScrollPosition = FeedbackUtil.subtract(this.startScrollPosition, mousePositionDelta);
            ViewPortActions.setScrollPosition(nextScrollPosition);
            store.dispatch(updateCustomCursorStyle(CustomCursorStyle.GRABBING));
        } else {
            store.dispatch(updateCustomCursorStyle(CustomCursorStyle.GRAB));
        }
        EditorModel.canvas.style.cursor = "none";
    }
}