import type TPromise from "./TPromise";

enum statusEnum {
  pending,
  fulfilled,
  rejected
}

type Resolve = (value?: any) => any
type Reject = (reason?: any) => any
type Executor = (resolve: Resolve, reject: Reject) => any

type OnFulfilled = (value: any) => any
type OnRejected = ((reason: any) => any)
type Then = (onFulfilled?: OnFulfilled, onRejected?: OnRejected) => TPromise

export {statusEnum, Resolve, Reject, Executor, OnFulfilled, OnRejected, Then}
