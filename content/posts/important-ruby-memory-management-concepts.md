---
title: 'Important Ruby Memory Management Concepts'
date: '2019-07-22'
published: true
layout: post
tags: ['garbage collection', 'ruby', 'performance', 'concepts']
category: 'work'
---

## How does Garbage Collection work in Ruby?

At its most basic, when you create a Ruby object, memory is allocated for it. The object lives for a while, hopefully doing some useful work. Then, when the object is no longer in use, Ruby marks that section of the memory as available for future use by other objects.

### 2 different sets of memory

- Malloc heap: Everything in your program is included in this section of memory. It’s not released back to the operating system unless the memory is known to be unused by Ruby at the end of a garbage collection. Examples - string buffers and data structures managed by C extension.
- Ruby object heap: Subset of malloc heap. Most ruby objects live here. Large ones point to malloc heap. Point of main focus.

### Mark and Sweep

You can call the strategy as `semi-conservative mark-and-sweep`. But what is it?

#### Mark

- First, allocating memory takes some time, so Ruby pre-allocates thousands of objects to have them ready when you need them. This is called the "free list."
- Ruby uses a tricolor mark and sweep garbage collection algorithm. Every object is marked either white, black, or gray, hence the name tricolor.
- Starts with mark phase and marks everything as white. White means not yet reviewed.
- Marks grey for all objects that are accessible. These may be constants or variables in the current scope.This means that the object should not be garbage collected, but hasn’t been fully examined.
- For each object marked with a gray flag, all its connections are examined. For each reviewed object, if it has a white flag, the flag is changed to gray.
- Finally, after all the connections of a given object have been examined, the initial root object with the gray flag is marked with a black flag. A black flag means "do not garbage collect, this object is in use". The collector then starts examining another object with a gray flag.
- After all the objects with gray flags have been examined, all objects in the Ruby heap should have either a black flag or a white flag. Black flagged objects should not be garbage collected. White flagged objects are not connected to any black-flagged objects and can be deleted.

#### Sweep

- The memory that the white flagged objects are allocated in is then returned to the Ruby heap. This is the ‘sweep’ phase. Basically, calls `free()` with the object_id for each white objects.

As you can see, most of the complexity is in `Mark` phase.

### Generational Garbage Collection

- Introduced in Ruby 2.1.
- Based on the theory that most objects are used briefly and then aren’t needed anymore
- Ruby maintains separate object spaces for "young" and "old" objects. Then it goes through only the young spaces most of the time. This is the "minor GC" phase.
- If an object survives three garbage collections, it’s promoted to the "old" object space. These objects are checked only during a "major GC".
- If there isn’t enough space in the young space to create new objects, then Ruby runs garbage collection on the "old space".
- The minor GC takes less time, so the overall time spent in garbage collection is less

### Incremental Garbage Collection

- Introduced in Ruby 2.2.
- Generational garbage collection has a flaw. The collecting of objects from the "new object" area is fast. But any objects outside of that are only collected when there is a full garbage collection.
- There can be many objects outside of the "new object" area, and that means that a full garbage collection impacts performance.
- Incremental garbage collection allows for the interweaving of full garbage collection and the execution of the program.
- This means that a full garbage collection no longer has as large a performance impact because the program can execute at the same time.
- Achieving incremental garbage collection in Ruby was pretty hard and complicated. It involved adding the concept of protected and unprotected objects.
- If a hash that was marked as black (fully examined and points to no white objects), has a new object added to it, it will be marked with a white flag and maybe collected by the garbage collector. This is a big problem in runtime.
- This algorithm solves this issue by using what is called a "write barrier". The "write barrier" detects any time a black object references a new, or white, object, and informs the garbage collector that what it thought was so (a black object will never reference a white object) isn’t true.

### Compaction

- Introduced in Ruby 2.7.
- It uses the “two fingers” algorithm to compact the Ruby heap.
- The heap is the section of memory that allocates to programs. As objects are allocated and freed, the space you’re using on the heap can get messy, with gaps of unused space between your objects.
- If memory is fragmented, a Ruby object can’t use a large contiguous chunk, which negatively affects access performance.
- If instead you compact the used memory together, then all your objects are together and there’s no wasted space.
- More detail can be found in this [video](https://www.youtube.com/watch?v=H8iWLoarTZc)

## How to be GC friendly?

- **Avoid circular references**: If two objects reference each other, they will never get collected.
- **Be careful with long-lived objects**: Globals and top-level variables are never garbage collected during the life of a Ruby program, so minimize their use.
- **Monitor memory usage**: Run `GC.stat`. Monitor `major_gc_count`, `minor_gc_count`, `old_objects`, `oldmalloc_increase_bytes` and `malloc_increase_bytes`. Track `heap_free_slots`. This shows if anything is causing a huge memory allocation. Finally track `NoMemoryErrors`. This is major indicator for memory leak.

### Alternative memory allocators

- [jemalloc](http://jemalloc.net/)
- [tcmalloc](https://github.com/google/tcmalloc)
- [ptmalloc](http://www.malloc.de/en/)

Before you switch the memory allocators in production, make sure to test your application under a variety of real-world traffic and usage to see how your memory usage changes.

Watch these two videos for a complete understanding of how memory is allocataed and cleaned in Ruby.

[Trash talk by Colin Fulton](https://www.youtube.com/watch?v=qXo3fqjY50o)
[Compacting heaps in Ruby 2.7 by Aaron Patterson](https://www.youtube.com/watch?v=1F3gXYhQsAY)
