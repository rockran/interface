import { formatDollar } from './formatDollarAmt'

//TODO(lynnshaoyu): add unit test for currencyAmountToPreciseFloat

describe('formatDollar for a price', () => {
  it('undefined or null', () => {
    expect(formatDollar(undefined, true)).toEqual('-')
    expect(formatDollar(null, true)).toEqual('-')
  })
  it('0', () => {
    expect(formatDollar(0, true)).toEqual('$0.00')
  })
  it('< 0.000001', () => {
    expect(formatDollar(0.00000000011231231432, true)).toEqual('$1.12e-10')
  })
  it('num >= 0.000001 && num < 0.1', () => {
    expect(formatDollar(0.00123123124, true)).toEqual('$0.00123')
  })
  it('num >= 0.1 && num < 1.05', () => {
    expect(formatDollar(0.812831, true)).toEqual('$0.813')
  })
  it('number is greater than 1.05', () => {
    expect(formatDollar(102312.408, true)).toEqual('$102312.41')
  })
})

describe('formatDollar for a non-price amount', () => {
  it('undefined or null', () => {
    expect(formatDollar(undefined)).toEqual('-')
    expect(formatDollar(null)).toEqual('-')
  })
  it('0', () => {
    expect(formatDollar(0)).toEqual('0')
  })
  it('< 0.000001', () => {
    expect(formatDollar(0.0000000001)).toEqual('$<0.000001')
  })
  it('num >= 0.000001 && num < 0.1', () => {
    expect(formatDollar(0.00123123124)).toEqual('$0.00123')
  })
  it('num >= 0.1 && num < 1.05', () => {
    expect(formatDollar(0.812831)).toEqual('$0.813')
  })
  it('number is greater than 1.05', () => {
    expect(formatDollar(102312.408)).toEqual('$102.31K')
  })
})
