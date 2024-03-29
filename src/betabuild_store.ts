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
  limit = 150,
  remove_request: boolean = false
): any {
  let rev_changed = true

  if (remove_request) {
    rev_changed = false
  }

  let arr: string[] = []

  if (current_val !== '') {
    if (current_val.search(';') !== -1) {
      arr = current_val.split(';')
      for (const item of arr) {
        if (version_val === item) {
          if (remove_request) {
            const index = arr.indexOf(item, 0)
            if (index > -1) {
              arr.splice(index, 1)
              rev_changed = true
            }
          } else {
            rev_changed = false
          }

          break
        }
      }
    } else {
      if (version_val === current_val) {
        if (remove_request) {
          current_val = 'init_item'
          rev_changed = true
        } else {
          rev_changed = false
        }
      }

      arr.push(current_val)
    }
  }

  if (rev_changed && !remove_request) {
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
