import {ParjsAction} from "../../../base/action";
import {QUIET_RESULT, Issues} from "../../common";
import {AnyParserAction} from "../../../abstract/basics/action";
import {ParsingState} from "../../../abstract/basics/state";
import {ResultKind} from "../../../abstract/basics/result";
/**
 * Created by User on 21-Nov-16.
 */
export class PrsMany extends ParjsAction {
    isLoud : boolean;
    displayName = "many";
    expecting : string;
    constructor(private inner : AnyParserAction, private maxIterations : number, private minSuccesses : number) {
        super();
        this.isLoud = inner.isLoud;
        this.expecting = inner.expecting;
        maxIterations >= minSuccesses || Issues.willAlwaysFail(this);
    }

    _apply(ps : ParsingState) {
        let {inner, maxIterations, minSuccesses} = this;
        let {position} = ps;
        let arr = [];
        let i = 0;
        while (true) {
            inner.apply(ps);
            if (!ps.isOk) break;
            if (i >= maxIterations) break;
            if (maxIterations === Infinity && ps.position === position) {
                Issues.guardAgainstInfiniteLoop(this);
            }
            position = ps.position;
            arr.maybePush(ps.value);
            i++;
        }
        if (ps.kind >= ResultKind.HardFail) {
            return;
        }
        if (i < minSuccesses) {
            ps.kind = i === 0 ? ResultKind.SoftFail : ResultKind.HardFail;
            return;
        }
        ps.value = arr;
        //recover from the last failure.
        ps.position = position;
        ps.kind = ResultKind.OK;
    }
}