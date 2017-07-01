/**
 * @module parjs
 */ /** */

import {AnyParser} from "./any";
import {ReplyKind, Reply} from "./reply";
import {QuietParser} from "./quiet";

/**
 * A projection on the parser result and the parser state.
 */
export interface ParjsProjection<T, TOut> {
    (value : T, userState : any) : TOut;
}
/**
 * A predicate on the parser result and the user state.
 */
export type ParjsPredicate<T> = ParjsProjection<T, boolean>;


/**
 * Interface for parsers that produce result values of type  {T}
 * @see QuietParser
 */
export interface LoudParser<T> extends AnyParser {
    /**
     * Applies {this} on the given input string.
     * @param input The input string.
     * @param initialState An object containing properties that are merged with this parse invocation's user state.
     */
    parse(input : string, initialState ?: object) : Reply<T>;

    //+++ ALTERNATIVE

    /**
     * Combinator.
     * P will try to apply {this}. If {this} fails softly, P will backtrack to the original position and try to apply {second} instead.
     * If {second} fails softly, P will also fail softly.
     * @param second The alternative parser.
     */
    or<S>(second : LoudParser<S>) : LoudParser<T | S>;
    /**
     * Similar to other overloads. P will try two parsers after this one.
     * @param second The 2nd parser to try, after {this}.
     * @param third The 3rd parser to try, after the second one.
     */
    or<A, B>(second : LoudParser<A>, third : LoudParser<B>) : LoudParser<T | A | B>;
    /**
     * Similar to the other overloads. P will try three parsers after this one.
     * @param second The 2nd parser to try.
     * @param third The 3rd parser to try
     * @param fourth The 4th parser to try
     */
    or<A, B, C>(second : LoudParser<A>, third : LoudParser<B>, fourth : LoudParser<C>) : LoudParser<T | A | B| C>;

    /**
     * Similar to other overloads. P will try four parsers after this one.
     * @param second The 2nd parser.
     * @param third The 3rd parser.
     * @param fourth The 4th parser.
     * @param fifth The 5th parser.
     */
    or<A, B, C, D>(second : LoudParser<A>, third : LoudParser<B>, fourth : LoudParser<C>, fifth : LoudParser<D>) : LoudParser<T | A | B| C | D>;

    /**
     * P behaves like the other overloads, except that it will try a variable number of parsers specified in {parsers}.
     * @param parsers Zero or more parsers to try.
     */
    or(...parsers : LoudParser<any>[]) : LoudParser<any>;

    /**
     * P will apply {this} and return the result. If {this} fails hard, P will fail soft. If {this} fails fatally, P will also fail fatally.
     * In other words, P will convert hard failures into soft ones.
     */
    soft : LoudParser<T>;

    /**
     * P will apply {this} and returns its value. If it fails softly, P will succeed return {val}.
     * @param val The value alternative.
     */
    orVal<S>(val : S) : LoudParser<T | S>;

    //+ Look Ahead

    /**
     * P will apply {this}. If it succeeds, it will backtrack to the original position in the input, effectively succeeding without consuming input.
     */
    readonly backtrack : LoudParser<T>;

    //+++MAPPING
    /**
     * P will apply {this}, and then apply the given projection on the result.
     * @param mapping The function to apply to the result.
     */
    map<S>(mapping : ParjsProjection<T, S>) : LoudParser<S>;

    /**
     * P will apply {this}, and then call the specified function on the result.
     * @param action The action to call.
     */
    act(action : ParjsProjection<T, void>) : LoudParser<T>;

    /**
     * This method returns {this}, with the result statically typed as {S}.
     * Only makes sense in TypeScript.
     */
    cast<S>() : LoudParser<S>;

    mixState(userState : any) : LoudParser<T>;

    /**
     *
     */
    readonly maybe : LoudParser<T>;


    //+++ RESTRICTIONS
    /**
     * P will apply {this}. If it succeeds, P will apply the given predicate on the result.
     * If the predicate returns false, P will fail hard, or else with the failure kind specified by {fail}.
     * @param condition The predicate.
     * @param name Optionally, the name of the condition the result must satisfy. For debugging purposes.
     * @param fail Optionally, the failure type emitted. Defaults to hard.
     */
    must(condition : ParjsPredicate<T>, name ?: string, fail ?: ReplyKind.Fail) : LoudParser<T>;

    /**
     * P will apply {this}. If it succeeds, P will check the result is not "empty", where an empty result means one of the following: null, undefined, "", [], {}.
     * If the result is empty, P will fail hard or according to the severity specified by {fail}.
     * @param fail Optionally, the failure kind. Defaults to hard.
     */
    mustBeNonEmpty(fail ?: ReplyKind.Fail) : LoudParser<T>;

    /**
     * P will apply {this}. If it succeeds, P will check the result is identical to one of the values specified in {options}.
     * Otherwise, it will fail hard or with the severity specified by {fail}.
     * @param options The possible results.
     * @param fail Optionally, the failure kind. Defaults to hard.
     */
    mustBeOf(options : T[], fail ?: ReplyKind.Fail) : LoudParser<T>;

    /**
     * P will apply {this}. If it succeeds, P makes sure the result is not identical to any of those specified in {options}.
     * Otherwise, it will fail hard or with the severity specified by {fail}.
     * @param options The prohibited results.
     * @parma fail Optionally, the failure kind. Defaults to hard.
     */
    mustNotBeOf(options : T[], fail ?: ReplyKind.Fail) : LoudParser<T>;

    /**
     * P will apply {this}. If it succeeds, P will check {this} consumed at least one character of the input.
     * Otherwise, it will fail hard or according to the severity specified by {fail}
     * @param kind The failure kind. Defaults to hard.
     */
    mustCapture(kind ?: ReplyKind.Fail) : LoudParser<T>;

    /**
     * P will apply {this} between two other parsers, and return only the result of {this}.
     * E.g.`x.between(a, b)` will apply parsers in the order: a, x, b; and return the result of x.
     * @param preceding The preceding parser.
     * @param proceeding The proceeding parser.
     */
    between(preceding : AnyParser, proceeding : AnyParser) : LoudParser<T>;

    /**
     * P will apply {this} between two appearances of the given parser, and return only the result of {this}.
     * E.g. x.between(y) will apply parsers in the order: y, x, y.
     * @param precedingAndPreceding The parser that surrounds {this}.
     */
    between(precedingAndPreceding : AnyParser) : LoudParser<T>;

    //+++SEQUENTIAL
    /**
     * P will apply {this} and then immediately the given quiet parser. It will return the result of {this}.
     * P will fail softly if {this} fails softly. P will fail hard if either parser fails hard or if the second parser fails softly.
     * @param quiet The quiet parser to follow this one.
     */
    then(quiet : QuietParser) : LoudParser<T>;

    /**
     * P will apply {this} and then immediately the given loud parser. If both succeed, it will return both results in an array.
     * P will fail softly if {this} fails softly. P will fail hard if either parser fails hard or if the second parser fails softly.
     * @param loud The loud parser to follow this one.
     */
    then<S>(loud : LoudParser<S>) : LoudParser<[T, S]>;


    /**
     * P will apply {this} and then immediately a sequence of parsers, each either quiet or loud returning T.
     * P will return an array consisting of all non-quiet results.
     * @param quietOrLoud The series of quiet or loud parsers.
     */
    then(...quietOrLoud : (LoudParser<T> | QuietParser)[]) : LoudParser<T[]>;

    /**
     * P will apply {this}, and then immediately a sequence of quiet parsers.
     * P will return {this}'s result.
     * @param quiet The sequence of quiet parsers.
     */
    then(...quiet : QuietParser[]) : LoudParser<T>;

    /**
     * An advanced combinator.
     * P will apply {this}, and then call the selector function with {this}'s return value. The function returns another parser.
     * P will then apply that parser and return its result.
     * Because parser construction can be expensive, you can optionally provide a Map object which is used as a cache.
     * @param selector The function that selects which parser to apply next.
     * @param cache An optional cache object.
     */
    thenChoose<TParser extends LoudParser<any>>(selector : (value : T) => TParser, cache ?: Map<T, AnyParser>) : TParser

    /**
     * P will apply {this} exactly {count} times and return an array of the results.
     * P will fail softly if {this} fails softly the 1st time, and it will fail hard if {this} fails softly afterwards.
     * @param count The number of times to apply {this}.
     */
    exactly(count : number) : LoudParser<T[]>;

    /**
     * P will apply {this} repeatedly until it fails softly. P will return all the results in an array.
     * P will fail hard only if {this} fails hard at any time it is applied.
     * @param minSuccess Optionally, the minimum number of times {this} must succeed. If specified, if {this} succeeds fewer times, P will fail hard.
     * @param maxIterations Optionally, the maximum number of times {this} is applied. Defaults to Infinity.
     */
    many(minSuccess ?: number, maxIterations ?: number) : LoudParser<T[]>;

    /**
     * P will apply {this} many times, until {till} succeeds, and then it will return the results of {this} in an array.
     *
     * In more detail: P will apply {this}. If it succeeds, it will immediatly apply {till}. If {till} fails softly, P repeats.
     * P fails hard if {this} or {till} fail hard.
     * If {this} fails before {till}, behavior is determined by the {tillOptional} parameter. By default, P will fail hard in this case too.
     * @param till The parser that
     * @param tillOptional If true, P will stop applying {this} if it fails softly, thus behaving like the many() combinator.
     */
    manyTill(till : AnyParser, tillOptional ?: boolean) : LoudParser<T[]>;

    /**
     * P will apply {this}. If it succeeds, it will pass its result to the {till} predicate. If it returns false, then P repeats.
     * 
     * This combinator behaves like the other version of manyTill, except that it applies a predicate instead of a parser. 
     * @param till The predicate that determines whether iterating {this} should be stopped.
     * @param tillOptional Whether it's okay for {this} to fail before {till} returns false.
     */
    manyTill(till : ParjsPredicate<T>, tillOptional ?: boolean) : LoudParser<T[]>

    /**
     * P will apply {this} and then {delimeter} repeatedly, until either fails softly. It returns all the results of {this}.
     * If {this} fails softly after {delimeter} has succeeded, P will backtrack to before {delimeter} succeeded.
     * @param delimeter The delimeter parser.
     * @param max The maximum number of times {this} is applied.
     */
    manySepBy(delimeter : AnyParser, max ?: number) : LoudParser<T[]>;

    /**
     * P will wrap {this} in a nested parser construct.
     * It will apply {this} with an isolated parser state equal to the initial state. It will then return the value of {this}.
     * However, the isolated parser state of {this} will be lost, so you must extract any information through the return value.
     */
    readonly isolate;
}
