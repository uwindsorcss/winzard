let cache = {}
let pendingCourses = false

class PermutationBuilder {
    // todo: roll this into a class
}

const getCourse = (code) =>
    new Promise((resolve, reject) => {
        if(cache[code] !== undefined)
            resolve(cache[code])
        else {
            fetch(`https://boratto.ca/winzard/api/options?code=${code}`)
                .then(r => r.json())
                .then(course => { 
                    cache[code] = course
                    resolve(course)
                })
        }
    })

let testCourses = ["COMP1410", "COMP2650", "MATH1730", "MATH1020"]

const getTestCourses = async () => {
    let courses = []
    for (const code of testCourses) {
        await getCourse(code)
        // set time intervals (mutate cache)
        for(const option of cache[code]) {
            option.TimeInterval = []
            for(const day of option.Times.Lab.Days) {
                const dayMin = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].indexOf(day) * 24 * 60
                const hourStartMin = parseInt(option.Times.Lab.Hours[0].split(":")[0]) * 60
                const minutStartMin = parseInt(option.Times.Lab.Hours[0].split(":")[1])
                const startMin = dayMin + hourStartMin + minutStartMin
                const hourEndMin = parseInt(option.Times.Lab.Hours[1].split(":")[0]) * 60
                const minutEndMin = parseInt(option.Times.Lab.Hours[1].split(":")[1])
                const endMin = dayMin + hourEndMin + minutEndMin
                option.TimeInterval.push([startMin, endMin])
            }
            for(const day of option.Times.Lecture.Days) {
                const dayMin = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].indexOf(day) * 24 * 60
                const hourStartMin = parseInt(option.Times.Lecture.Hours[0].split(":")[0]) * 60
                const minutStartMin = parseInt(option.Times.Lecture.Hours[0].split(":")[1])
                const startMin = dayMin + hourStartMin + minutStartMin
                const hourEndMin = parseInt(option.Times.Lecture.Hours[1].split(":")[0]) * 60
                const minutEndMin = parseInt(option.Times.Lecture.Hours[1].split(":")[1])
                const endMin = dayMin + hourEndMin + minutEndMin
                option.TimeInterval.push([startMin, endMin])
            }
        }
        const random = Math.floor(cache[code].length * Math.random())
        courses.push(cache[code])
    }
    courses = courses.sort((a, b) => a.Code > b.Code ? 1 : -1)
    return courses
}

const cartesian = (...all) => {
    const loop = (t, a, ...more) =>
      a === undefined
        ? [ t ]
        : a.flatMap(x => loop([ ...t, x ], ...more))
    return loop([], ...all)
  }  

const listAllPermutations = (options, perm=[]) => {
    const O = options.pop()
    perm.unshift(O.map((o, i) => i))
    if(options.length === 0)
        return cartesian(...perm)
    return listAllPermutations(options, perm)
}

const getPermutation = (options, chosen) => {
    const perm = []
    for(let i = 0; i < chosen.length; i++) {
        perm.push(options[i][chosen[i]])
    }
    return perm
}

const coursesOverlap = (list) => {
    const intervals = []
    for(const course of list) {
        intervals.push(...course.TimeInterval)
    }
    intervals.sort((a, b) => a[0] - b[0])
    for(let i = 0; i < intervals.length - 1; i++) {
        if(intervals[i][1] > intervals[i+1][0])
            return true
    }
    return false
}

const findNextValid = (courses, permutations, permutationID) => {
    const permutation = getPermutation(courses, permutations[permutationID])
    if(coursesOverlap(permutation))
        return findNextValid(courses, permutations, permutationID + 1)
    return permutation
}

const findLastValid = (courses, permutations, permutationID) => {
    const permutation = getPermutation(courses, permutations[permutationID])
    if(coursesOverlap(permutation))
        return findLastValid(courses, permutations, permutationID - 1)
    return permutation
}

export { testCourses, getTestCourses, listAllPermutations, getPermutation, coursesOverlap, findLastValid, findNextValid }