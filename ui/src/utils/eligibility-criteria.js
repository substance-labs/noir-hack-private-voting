import countries from "i18n-iso-countries"

export const ruleToText = (rule) => {
  if (rule.includes("age >= ")) {
    const age = rule.slice(7)
    return `You must be at least ${age} years old to vote`
  }

  if (rule.includes("age < ")) {
    const age = rule.slice(7)
    return `You must be under ${age} years old to vote.`
  }

  if (rule.includes("nationality == ")) {
    const nationality = rule.slice(15)
    return `You must be a resident of ${countries.getName(nationality, "en")} to vote`
  }

  return null
}
