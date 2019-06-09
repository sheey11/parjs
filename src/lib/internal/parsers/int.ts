/**
 * @module parjs/internal/implementation/parsers
 */
/** */

import {Parselets} from "./parselets";
import {ParsingState} from "../state";
import {ReplyKind} from "../../reply";
import {ParserDefinitionError} from "../../errors";
import {ParjserBase} from "../parser";
import {Parjser} from "../../loud";
/**
 * Created by User on 28-Nov-16.
 */

/*
    Legal decimal integer format:
    (-|+)\d+
 */

export interface IntOptions {
    allowSign?: boolean;
    base?: number;
}

export function int(options: IntOptions): Parjser<number> {
    if (options.base > 36) {
        throw new ParserDefinitionError("int", "invalid base");
    }
    let expecting = `a ${options.allowSign ? "signed" : "unsigned"} integer in base ${options.base}`;
    return new class Int extends ParjserBase {
        type = "int";
        displayName = "int";
        expecting = expecting;

        _apply(ps: ParsingState): void {
            let {allowSign, base} = options;
            let {position, input} = ps;
            let initPos = ps.position;
            let sign = allowSign ? Parselets.parseSign(ps) : 0;
            let parsedSign = false;
            if (sign !== 0) {
                parsedSign = true;
            } else {
                sign = 1;
            }
            position = ps.position;
            Parselets.parseDigitsInBase(ps, base);
            let value = parseInt(input.substring(initPos, ps.position), base);

            if (ps.position === position) {
                ps.kind = parsedSign ? ReplyKind.HardFail : ReplyKind.SoftFail;
            } else {
                ps.value = value;
                ps.kind = ReplyKind.Ok;
            }
        }

    }();
}
