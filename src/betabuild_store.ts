function ArrToStr(array: string[]): string {
  let IsFirst = true
  let result = ''

  for (const item of array) {
    if (IsFirst) {
      IsFirst = false
    } else {
      result = `${result};`
    }

    result = `${result}${item}`
  }

  return result
}

export function HandleStore(
  current_val: string,
  version_val: string,
  limit = 150
): object {
  let rev_changed = true

  let arr: string[] = []

  if (current_val !== '') {
    if (current_val.search(';') !== -1) {
      arr = current_val.split(';')
      for (const item of arr) {
        if (version_val === item) {
          rev_changed = false
          break
        }
      }
    } else {
      if (version_val === current_val) {
        rev_changed = false
      }

      arr.push(current_val)
    }
  }

  if (rev_changed) {
    arr.push(version_val)

    if (arr.length > limit) {
      arr.shift()
    }
  }

  const result = {
    Rev_is_changed: rev_changed,
    Value: ArrToStr(arr)
  }

  return result
}
