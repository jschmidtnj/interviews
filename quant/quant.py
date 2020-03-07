#!/bin/python3

import pandas as pd
import pandas_datareader as pdr
from scipy.stats import norm
from numpy import random, percentile, array
from datetime import datetime
import sqlite3


class quant:
    daily_returns_key = 'Daily Returns'
    adj_close_key = 'Adj Close'
    timestamp_key = 'Timestamp'
    open_key = 'Open'
    high_key = 'High'
    low_key = 'Low'
    close_key = 'Close'
    trading_days_per_month = 20

    def __init__(self, drop_table=False):
        """
        class containing solutions to 3 parts of the questions provided
        constructor for creating tables in sqlite and instantiating globals
        """
        self.start_data = '2019-1-1'
        self.end_data = '2019-12-31'
        db_name = 'SSMIF.db'
        self.table_name = 'Stock_Data'
        self.conn = sqlite3.connect(db_name)
        if drop_table:
            self.conn.cursor().execute('drop table if exists {}'.format(
                self.table_name
            ))
            self.conn.commit()
        self.conn.cursor().execute('''create table if not exists {} (
            "{}" INTEGER NOT NULL,
            "{}" DECIMAL(10, 2),
            "{}" DECIMAL(10, 2),
            "{}" DECIMAL(10, 2),
            "{}" DECIMAL(10, 2),
            "{}" DECIMAL(10, 2)
        );'''.format(
            self.table_name, self.timestamp_key, self.open_key,
            self.high_key, self.low_key, self.close_key, self.adj_close_key))
        self.conn.cursor().execute('DELETE FROM {};'.format(self.table_name))
        self.conn.commit()

    def __del__(self):
        """
        destructor to close connection to sqlite
        """
        self.conn.close()

    def Daily_Returns(self, adjusted_close_values):
        """
        return daily returns as percent
        there is a built-in function in pandas to do this, but I didn't use
        it because I didn't think that was the point of this question
        """
        res = pd.DataFrame(data={
            self.daily_returns_key: [0.0] * len(adjusted_close_values)
        })
        res[self.daily_returns_key][0] = None
        for i in range(1, len(adjusted_close_values)):
            res[self.daily_returns_key][i] = (adjusted_close_values[i] - adjusted_close_values[i - 1]) \
                / adjusted_close_values[i - 1]
        return res

    def validate_confidence_level(self, confidence_level):
        """
        checks for valid confidence level input
        """
        if confidence_level < 0 or confidence_level > 1:
            raise ValueError('invalid confidence level given')

    def get_stock_data(self, ticker):
        """
        gets stock data for given ticker from yahoo finance
        """
        try:
            return pdr.get_data_yahoo(ticker,
                                      start=self.start_data,
                                      end=self.end_data)
        except Exception as err:
            print('problem getting data for {}'.format(ticker))
            return

    def daily_to_monthly(self, daily):
        """
        converts daily statistic to monthly by multiplying by sqrt of trading days per month
        """
        return daily * (self.trading_days_per_month ** 0.5)

    def monthly_to_daily(self, monthly):
        """
        converts monthly statistic to daily by dividing by sqrt of trading days per month
        """
        return monthly / (self.trading_days_per_month ** 0.5)

    def Monthly_VaR(self, ticker, confidence_level=0.05, data=None):
        """
        this calculates the monthly VaR for a given ticker at a certain ci
        monte carlo simulation result returned
        parmetric and historical also calculated
        monte carlo and parametric requires numpy for ppf and random numbers,
        but historical can be calculated just with pandas stats library. monte carlo
        gives the best results though (according to internet).
        """
        self.validate_confidence_level(confidence_level)
        if data is None:
            try:
                cur = self.conn.cursor()
                cur.execute('select * from {}'.format(self.table_name))
                rows = cur.fetchall()
                timestamps = []
                if len(rows) == 0:
                    raise ValueError('no data found')
                num_columns = len(rows[0]) - 1
                columns = []
                for _ in range(num_columns):
                    columns.append([])
                for i in range(len(rows)):
                    timestamps.append(pd.to_datetime(rows[i][0], unit='s'))
                    for j in range(num_columns):
                        columns[j].append(rows[i][j + 1])
                data = pd.DataFrame(data={
                    self.timestamp_key: timestamps,
                    self.open_key: columns[0],
                    self.high_key: columns[1],
                    self.low_key: columns[2],
                    self.close_key: columns[3],
                    self.adj_close_key: columns[4]
                })
                data.set_index(self.timestamp_key, inplace=True)
            except Exception as err:
                print('error getting data from sqlite. falling back to api call')
                data = self.get_stock_data(ticker)
        returns = self.Daily_Returns(data[self.adj_close_key])[
            self.daily_returns_key]
        mean = returns.mean()
        std = returns.var() ** 0.5
        Z_ci = norm.ppf(1 - confidence_level)
        historical = self.daily_to_monthly(
            percentile(returns[1:], confidence_level * 100))
        parametric = self.daily_to_monthly(Z_ci * std)
        # print('parametric var: {:.3f}, historical var: {:.3f}'
        #       .format(parametric, historical))
        # seed generator
        random.seed(50)
        num_sims = 1e6
        simulated = random.normal(mean, std, int(num_sims))
        monte_carlo = self.daily_to_monthly(
            percentile(simulated, confidence_level * 100))
        # print('monte carlo var: {:.3f}'.format(monte_carlo))
        return monte_carlo

    def Monthly_CVaR(self, ticker, confidence_level=0.05):
        """
        CVaR - average of the worst losses - under var
        """
        data = self.get_stock_data(ticker)
        var = self.monthly_to_daily(
            self.Monthly_VaR(ticker, confidence_level, data))
        returns = self.Daily_Returns(data[self.adj_close_key])[
            self.daily_returns_key]
        return self.daily_to_monthly(returns[returns.lt(var)].mean())

    def Monthly_Volatility(self, ticker):
        """
        calculates volatility based on the returns over the course of a month
        """
        data = self.get_stock_data(ticker)
        return self.daily_to_monthly(
            self.Daily_Returns(data[self.adj_close_key])[self.daily_returns_key].var() ** 0.5)

    def Fill_Table(self, ticker):
        data = self.get_stock_data(ticker)
        for i in range(len(data[self.adj_close_key])):
            self.conn.cursor().execute('''
                insert into {} ("{}", "{}", "{}", "{}", "{}", "{}")
                values(?,?,?,?,?,?)
            '''.format(
                self.table_name, self.timestamp_key, self.open_key,
                self.high_key, self.low_key, self.close_key, self.adj_close_key),
                (int(data.index[i].timestamp()),
                 data[self.open_key][i],
                 data[self.high_key][i],
                 data[self.low_key][i],
                 data[self.close_key][i],
                 data[self.adj_close_key][i])
            )
        self.conn.commit()

    def _sum_single_list(self, list, mult, start, end):
        """
        helper - finds sum of a single list in the ssmif function
        """
        res = 0
        found_start = False
        found_end = False
        num_in_list = len(list)
        for i in range(num_in_list):
            if list[i] == start and i < num_in_list - 1 and end in list[i+1:]:
                found_start = True
            if found_start and not found_end:
                res += list[i] * mult
            else:
                res += list[i]
            if list[i] == end:
                found_end = True
        return res

    def sum_ssmif(self, nested_list):
        """
        finds special sum of nested list
        """
        sums = []
        for i in range(len(nested_list)):
            sums.append(self._sum_single_list(nested_list[i], 2, 9, 6)
                        if i % 2 == 0 else self._sum_single_list(nested_list[i], 3, 7, 4))
        return self._sum_single_list(sums, 0, 4, 5)


def main():
    ticker = 'AAPL'
    questions = quant()
    # this function needs to run first:
    questions.Fill_Table(ticker)
    print('VaR: {:.6f}'.format(questions.Monthly_VaR(ticker)))
    print('CVaR: {:.6f}'.format(questions.Monthly_CVaR(ticker)))
    print('volatility: {:.6f}'.format(questions.Monthly_Volatility(ticker)))
    print('logic output: {}'.format(questions.sum_ssmif([
        [1, 2, 3, 9, 2, 6, 1],
        [1, 3],
        [1, 2, 3],
        [7, 1, 4, 2],
        [1, 2, 2]])))
    del questions


if __name__ == '__main__':
    main()
