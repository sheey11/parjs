/**
 * @module parjs/internal/implementation/parsers
 */
/** */

import {ReplyKind} from "../../reply";
import {ParsingState} from "../state";
import {Parjser} from "../../loud";
import {ParjserBase} from "../parser";

export function result<T>(x: T): Parjser<T> {
    return new class Result extends ParjserBase {
        expecting = "anything";
        type = "result";
        _apply(ps: ParsingState): void {
            ps.value = x;
            ps.kind = ReplyKind.Ok;
        }

    }();
}
