# Requirements: shift calendar

The requirements behind the calendar, written as testable scenarios. They describe the behavior in the [live prototype](https://josephfanpm.github.io/eshyft-calendar/), and the calendar rules are covered by [`src/data.test.ts`](../src/data.test.ts). For the problem, decisions and results, see the [README](../README.md) and the [case study](CASE_STUDY.md).

## Goals

1. Give nurses a familiar calendar for discovering shifts.
2. Increase shift applications by helping nurses find shifts that match their real availability.

## User stories

- As a nurse, I want to view open shifts in a calendar format so that I can easily spot which days I'm free to work.
- As a nurse, I want to see my confirmed shifts alongside open shifts so that I can avoid scheduling conflicts.

## Scenarios

### 1. See a month at a glance

```gherkin
Feature: Month calendar

  Scenario: Each future day shows open and confirmed shifts by slot
    Given I am on the Calendar tab
    When I look at a day from today onward
    Then I see a day, evening and night icon for that day
    And a slot shows a green check if I'm confirmed for a shift in it
    And otherwise it shows blue if at least one shift in it is open
    And otherwise it shows gray

  Scenario: Past days are disabled
    Given I am on the Calendar tab
    When I look at a day before today
    Then the day shows no icons
    And I can't tap it

  Scenario: Browse ahead a limited number of months
    Given I am on the current month
    When I move forward
    Then I can reach the next four months and no further
```

### 2. See a day's shifts next to my bookings

```gherkin
Feature: Day view

  Scenario: Open a day with shifts
    Given a day shows at least one blue or green icon
    When I tap that day
    Then I see its shifts grouped into day, evening and night
    And my confirmed shifts appear in their slot

  Scenario: Open a day with nothing available
    Given every slot on a day is gray
    When I tap that day
    Then I see the empty state
```

### 3. Book a shift from the calendar

```gherkin
Feature: Apply and instant book

  Scenario: Instant-book a shift
    Given I open an open shift that allows instant book
    When I tap Instant book
    Then the shift is confirmed
    And its slot shows a green check on the calendar right away

  Scenario: Apply for a shift
    Given I open an open shift that doesn't allow instant book
    When I apply
    Then my application is sent
    And I can withdraw it from the shift detail

  Scenario: Call out of a confirmed shift
    Given I open a shift I'm confirmed for
    When I tap Call out
    Then I'm asked to confirm and told the facility will be notified
    When I confirm
    Then the shift is open again
```

## Out of scope

- Pay rates on the calendar. Tested and dropped; see the [README](../README.md#key-decisions-and-trade-offs).
- Saved recurring availability and importing a work schedule. On the [roadmap](../README.md#roadmap).
