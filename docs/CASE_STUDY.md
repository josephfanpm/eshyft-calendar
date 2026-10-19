# Case study: a calendar for booking nursing shifts

I was the product manager for this feature at ESHYFT, a marketplace where nursing homes post per diem shifts and CNAs, LPNs and RNs pick them up. The [interactive prototype](https://josephfanpm.github.io/eshyft-calendar/) in this repo is my own recreation of the shipped design, built for this portfolio. It uses made-up facilities and shift data and leaves out ESHYFT's branding. Results are given as relative changes.

## Who it was for

The nurse we designed for is busy. They have a full-time job, pick up per diem shifts around it, and keep two or three other staffing apps on their phone, booking whichever shift fits first.

Their free time is predictable. Because the full-time job sets the schedule, they tend to be free at the same times each week or month: every Thursday and Saturday, say, or the first weekend of the month. They open the app already knowing those days. The question is "what's open on my usual days off?", and if the app can't answer it quickly, another app on the same phone will.

## The problem

Nurses found shifts in two places, a shift list and a map. Both are organized around shifts, not days. To see what was open on their days off, a nurse had to change the date filters and then compare the results against the shifts they had already confirmed. A nurse who is free every Thursday had to repeat that for each Thursday, because a list can't show a pattern across the month. A calendar can.

Our nurse feedback form kept pointing at this. About 20% of nurses who gave feedback said they were unhappy with the shift confirmation process, and a common complaint was that there was no calendar view. Many nurses are used to browsing future shifts in a calendar from other staffing apps, and our research found that a calendar is the most common way booking products handle this.

## Goals

1. Give nurses a familiar calendar for discovering shifts.
2. Increase shift applications by helping nurses find shifts that match their real availability.

The user stories:

- As a nurse, I want to view open shifts in a calendar format so that I can easily spot which days I'm free to work.
- As a nurse, I want to see my confirmed shifts alongside open shifts so that I can avoid scheduling conflicts.

## What we built

A calendar view in the nurse app. Each day shows whether you already have a shift scheduled and whether open shifts are available. Tapping a day shows that day's open shifts next to your confirmed ones, and you can apply from there.

I worked with design on the Figma screens, and the designs and copy were final in April 2025. Engineering built it in the Flutter nurse app over three sprints, and it shipped in June 2025.

Loading a month of shifts at once made calendar load time a concern, so we opened a separate backend spike on improving it rather than holding the release.

## How we tested it

Before rolling the calendar out to everyone, I tested it against the existing list and map with a group of nurses. I also tested a second version that showed each shift's pay rate on the calendar, because pay is a big part of how nurses choose between shifts and I wanted to know whether it belonged on this screen.

## Impact

The calendar without pay rates won, and we rolled it out to every nurse on the app.

- Nurses who had the calendar applied to about 2% more shifts.
- Hours worked, confirmed shifts and call-outs held steady, so the extra applications didn't come from nurses booking shifts they later dropped.
- The version with pay rates did worse than the plain calendar.
- Nurses got the calendar they had been asking for in feedback, built around how they actually plan: by the days they're free.

## What I learned

I expected pay rates to help. My working theory is that a rate on every day turns a calendar about availability into a page for comparing prices, and nurses hold out for the best-paying day instead of booking the day they're free. That's a hypothesis, and it's what I'd test next.

A 2% lift on a core action is modest. It was still worth shipping, because nothing else got worse and it fixed one of the most common complaints in our feedback.

## What I'd do next

- Let nurses save their recurring availability, like "free every Thursday" or "first weekend of the month," and notify them when shifts open on those days. Their schedule repeats, so they shouldn't have to check the same days by hand every week.
- Let nurses block out their full-time work schedule or import it from their phone's calendar. For most of these nurses, ESHYFT shifts are only part of their week, and the calendar can only show real availability if it knows about the rest.
- Test showing the pay rate only after a nurse taps a day.
- Measure time from opening the app to submitting an application. The calendar should make booking faster, and an application count doesn't show that.
