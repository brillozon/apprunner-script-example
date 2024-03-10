#!/usr/bin/env python3

import sys
import time

# Simulate performing actual work here
def do_work(*args,**kwargs):
    # Verify we receive the arguments we expected
    for i, arg in enumerate(*args):
        print(f'Arg: {i}, Value: {arg}')
    
    # It actually takes time to process things, donut?
    time.sleep(5)

# Run as a command line script
if __name__ == "__main__":
    try:
        do_work(sys.argv[1:])
    except Exception as e:
        print(e)
    finally:
        print(f'Done')
