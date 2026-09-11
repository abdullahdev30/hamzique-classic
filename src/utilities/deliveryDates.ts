export type DeliveryWindow = {
  deliveryEnd: string
  deliveryStart: string
  dispatchDate: string
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  weekday: 'short',
})

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const addWorkingDays = (date: Date, days: number) => {
  let next = new Date(date)
  let remaining = days

  while (remaining > 0) {
    next = addDays(next, 1)
    const day = next.getDay()

    if (day !== 0 && day !== 6) {
      remaining -= 1
    }
  }

  return next
}

export const getDeliveryWindow = (from = new Date()): DeliveryWindow => {
  const dispatchDate = addDays(from, 3)
  const deliveryStart = addWorkingDays(dispatchDate, 2)
  const deliveryEnd = addWorkingDays(dispatchDate, 3)

  return {
    deliveryEnd: dateFormatter.format(deliveryEnd),
    deliveryStart: dateFormatter.format(deliveryStart),
    dispatchDate: dateFormatter.format(dispatchDate),
  }
}
