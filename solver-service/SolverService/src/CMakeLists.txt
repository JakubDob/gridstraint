add_subdirectory(messaging)
add_subdirectory(solver)

target_sources(
    SolverService PRIVATE
    main.cpp
)