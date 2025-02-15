import { expect } from 'chai';
import * as React from 'react';
import { screen } from '@mui/monorepo/test/utils';
import { adapterToUse } from 'test/utils/pickers-utils';
import { DescribeValidationTestSuite } from './describeValidation.types';

const toMinutesLabel = (minutes: number | string) =>
  `${Number(minutes) < 10 ? `0${minutes}` : minutes} minutes`;

export const testMinutesViewValidation: DescribeValidationTestSuite = (
  ElementToTest,
  getOption,
) => {
  const { componentFamily, views, render, clock, withDate, withTime, variant } = getOption();

  if (
    !views.includes('minutes') ||
    !variant ||
    componentFamily !== 'picker' ||
    variant === 'desktop'
  ) {
    return;
  }

  describe('minutes view:', () => {
    const defaultProps = {
      onChange: () => {},
      open: true,
      view: 'minutes',
      openTo: 'minutes',
      reduceAnimations: true,
      slotProps: { toolbar: { hidden: true } },
    };

    it('should apply shouldDisableTime', function test() {
      render(
        <ElementToTest
          {...defaultProps}
          value={adapterToUse.date(new Date(2018, 2, 12, 8, 15, 0))}
          shouldDisableTime={(date) =>
            adapterToUse.isAfter(date, adapterToUse.date(new Date(2018, 2, 12, 8, 20, 0)))
          }
        />,
      );

      expect(screen.getByRole('option', { name: toMinutesLabel('10') })).not.to.have.attribute(
        'aria-disabled',
      );
      expect(screen.getByRole('option', { name: toMinutesLabel('15') })).not.to.have.attribute(
        'aria-disabled',
      );
      expect(screen.getByRole('option', { name: toMinutesLabel('20') })).not.to.have.attribute(
        'aria-disabled',
      );
      expect(screen.getByRole('option', { name: toMinutesLabel('25') })).to.have.attribute(
        'aria-disabled',
      );
      expect(screen.getByRole('option', { name: toMinutesLabel('30') })).to.have.attribute(
        'aria-disabled',
      );
      expect(screen.getByRole('option', { name: toMinutesLabel('55') })).to.have.attribute(
        'aria-disabled',
      );
    });

    it('should apply disablePast', function test() {
      let now;
      function WithFakeTimer(props) {
        now = adapterToUse.date(new Date());
        return <ElementToTest value={now} {...props} />;
      }
      const { setProps } = render(<WithFakeTimer {...defaultProps} disablePast />);

      const tomorrow = adapterToUse.addDays(now, 1);
      const currentMinutes = adapterToUse.getMinutes(now);
      const closestNowMinutesOptionValue = Math.floor(currentMinutes / 5) * 5;
      const previousMinutesOptionValue = Math.floor(currentMinutes / 5) * 5 - 5;
      const nextMinutesOptionValue = Math.floor(currentMinutes / 5) * 5 + 5;

      expect(
        screen.getByRole('option', { name: toMinutesLabel(previousMinutesOptionValue) }),
      ).to.have.attribute('aria-disabled');
      if (currentMinutes <= closestNowMinutesOptionValue) {
        expect(
          screen.getByRole('option', { name: toMinutesLabel(closestNowMinutesOptionValue) }),
        ).not.to.have.attribute('aria-disabled');
      } else {
        expect(
          screen.getByRole('option', { name: toMinutesLabel(closestNowMinutesOptionValue) }),
        ).to.have.attribute('aria-disabled');
      }
      expect(
        screen.getByRole('option', { name: toMinutesLabel(nextMinutesOptionValue) }),
      ).not.to.have.attribute('aria-disabled');

      // following validation is relevant only for DateTimePicker
      if (!withDate || !withTime) {
        return;
      }

      setProps({ value: tomorrow });
      clock.runToLast();
      expect(
        screen.getByRole('option', { name: toMinutesLabel(previousMinutesOptionValue) }),
      ).not.to.have.attribute('aria-disabled');
      expect(
        screen.getByRole('option', { name: toMinutesLabel(closestNowMinutesOptionValue) }),
      ).not.to.have.attribute('aria-disabled');
    });

    it('should apply disableFuture', function test() {
      let now;
      function WithFakeTimer(props) {
        now = adapterToUse.date(new Date());
        return <ElementToTest value={now} {...props} />;
      }
      const { setProps } = render(<WithFakeTimer {...defaultProps} disableFuture />);

      const yesterday = adapterToUse.addDays(now, -1);
      const currentMinutes = adapterToUse.getMinutes(now);
      const closestNowMinutesOptionValue = Math.floor(currentMinutes / 5) * 5;
      const previousMinutesOptionValue = Math.floor(currentMinutes / 5) * 5 - 5;
      const nextMinutesOptionValue = Math.floor(currentMinutes / 5) * 5 + 5;

      expect(
        screen.getByRole('option', { name: toMinutesLabel(previousMinutesOptionValue) }),
      ).not.to.have.attribute('aria-disabled');
      if (currentMinutes < closestNowMinutesOptionValue) {
        expect(
          screen.getByRole('option', { name: toMinutesLabel(closestNowMinutesOptionValue) }),
        ).to.have.attribute('aria-disabled');
      } else {
        expect(
          screen.getByRole('option', { name: toMinutesLabel(closestNowMinutesOptionValue) }),
        ).not.to.have.attribute('aria-disabled');
      }
      expect(
        screen.getByRole('option', { name: toMinutesLabel(nextMinutesOptionValue) }),
      ).to.have.attribute('aria-disabled');

      // following validation is relevant only for DateTimePicker
      if (!withDate || !withTime) {
        return;
      }

      setProps({ value: yesterday });
      clock.runToLast();
      expect(
        screen.getByRole('option', { name: toMinutesLabel(previousMinutesOptionValue) }),
      ).not.to.have.attribute('aria-disabled');
      expect(
        screen.getByRole('option', { name: toMinutesLabel(closestNowMinutesOptionValue) }),
      ).not.to.have.attribute('aria-disabled');
    });

    it('should apply maxTime', function test() {
      render(
        <ElementToTest
          {...defaultProps}
          value={adapterToUse.date(new Date(2019, 5, 15, 11, 15, 0))}
          maxTime={adapterToUse.date(new Date(2019, 5, 15, 11, 20, 0))}
        />,
      );
      expect(screen.getByRole('option', { name: toMinutesLabel('10') })).not.to.have.attribute(
        'aria-disabled',
      );
      expect(screen.getByRole('option', { name: toMinutesLabel('15') })).not.to.have.attribute(
        'aria-disabled',
      );
      expect(screen.getByRole('option', { name: toMinutesLabel('20') })).not.to.have.attribute(
        'aria-disabled',
      );
      expect(screen.getByRole('option', { name: toMinutesLabel('25') })).to.have.attribute(
        'aria-disabled',
      );
    });

    it('should apply minTime', function test() {
      render(
        <ElementToTest
          {...defaultProps}
          value={adapterToUse.date(new Date(2019, 5, 15, 11, 15, 0))}
          minTime={adapterToUse.date(new Date(2019, 5, 15, 11, 10, 0))}
        />,
      );
      expect(screen.getByRole('option', { name: toMinutesLabel('0') })).to.have.attribute(
        'aria-disabled',
      );
      expect(screen.getByRole('option', { name: toMinutesLabel('5') })).to.have.attribute(
        'aria-disabled',
      );
      expect(screen.getByRole('option', { name: toMinutesLabel('10') })).not.to.have.attribute(
        'aria-disabled',
      );
      expect(screen.getByRole('option', { name: toMinutesLabel('15') })).not.to.have.attribute(
        'aria-disabled',
      );
    });
  });
};
