import {FEEDBACK} from '../interfaces/Feedback';

export class FeedbackUtil {
    public static equals(p1: FEEDBACK, p2: FEEDBACK): boolean {
        return p1.x === p2.x && p1.y === p2.y;
    }

    public static add(p1: FEEDBACK, p2: FEEDBACK): FEEDBACK {
        return {
            x: p1.x + p2.x,
            y: p1.y + p2.y
        }
    }

    public static subtract(p1: FEEDBACK, p2: FEEDBACK): FEEDBACK {
        return {
            x: p1.x - p2.x,
            y: p1.y - p2.y
        }
    }

    public static multiply(p1: FEEDBACK, factor: number) {
        return {
            x: p1.x * factor,
            y: p1.y * factor
        }
    }
}