import moment, { DurationInputArg2, unitOfTime, MomentInput } from 'moment'
import 'moment/locale/zh-cn'

export const yyyyMMDDHHmmss = 'yyyy-MM-DD HH:mm:ss'
export const yyyyMMDDHHmm = 'yyyy-MM-DD HH:mm'
export const yyyyMMDD = 'yyyy-MM-DD'

export const getLastMonthRange = (
  time?: MomentInput,
  type: unitOfTime.StartOf = 'month'
) => {
  let timeMoment
  const dateType = `${type}s` as DurationInputArg2
  if (time) {
    timeMoment = moment(time)
  } else {
    timeMoment = moment().subtract(1, dateType)
  }

  const firstDay = timeMoment.startOf(type).format(yyyyMMDD)
  const lastDay = timeMoment.add(1, dateType).startOf(type).format(yyyyMMDD)
  return { firstDay, lastDay }
}

export const transformTimeToUtc = (time: MomentInput): string => {
  return moment(time).utc().format()
}

export const getFormUtcToLocalMoment = (time: string) => {
  const m = moment.utc(time)
  return m.utcOffset(moment.parseZone().utcOffset())
}

export const transformUtcToLocal = (
  time: string,
  format = yyyyMMDDHHmmss
): string => {
  return getFormUtcToLocalMoment(time).format(format)
}

export const getFromNowString = (time: MomentInput): string => {
  const now = moment.utc()
  const incomingTime = moment.utc(time)
  if (moment(now).isBefore(incomingTime)) {
    return now.fromNow()
  }
  return incomingTime.fromNow()
}

export const orgMoment = moment
